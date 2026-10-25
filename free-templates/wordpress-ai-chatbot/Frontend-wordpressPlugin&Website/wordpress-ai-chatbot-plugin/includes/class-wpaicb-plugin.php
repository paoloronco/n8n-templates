<?php
if (!defined('ABSPATH')) { exit; }

class WPAICB_Plugin {

    const OPT_ENDPOINT = 'wpaicb_endpoint';
    const OPT_AUTH_NAME = 'wpaicb_auth_header_name';
    const OPT_AUTH_VALUE = 'wpaicb_auth_header_value';
    const OPT_SITE_HOME = 'wpaicb_site_home';
    const REST_NAMESPACE = 'wpaicb/v1';
    const REST_CHAT_ROUTE = '/chat';
    const REST_TEST_ROUTE = '/test';

    public function init() {
        add_action('admin_menu', [$this, 'admin_menu']);
        add_action('admin_init', [$this, 'register_settings']);

        add_shortcode('wp_ai_chatbot', [$this, 'shortcode']);

        add_action('wp_enqueue_scripts', [$this, 'enqueue_assets']);

        // Register REST API endpoints
        add_action('rest_api_init', [$this, 'register_rest_routes']);

        // Keep legacy AJAX endpoints for backwards compatibility
        add_action('wp_ajax_wpaicb_send', [$this, 'ajax_send']);
        add_action('wp_ajax_nopriv_wpaicb_send', [$this, 'ajax_send']);
        add_action('wp_ajax_wpaicb_test', [$this, 'ajax_test']);
    }

    /**
     * Register REST API endpoints
     */
    public function register_rest_routes() {
        // Health check endpoint - for diagnostics
        register_rest_route(self::REST_NAMESPACE, '/health', [
            'methods' => 'GET',
            'callback' => function() {
                return new \WP_REST_Response([
                    'status' => 'ok',
                    'message' => 'WP AI Chatbot REST API is working',
                    'namespace' => self::REST_NAMESPACE,
                ], 200);
            },
            'permission_callback' => '__return_true',
        ]);

        // Chat endpoint - accessible to anyone (public chatbot)
        // Use __return_true to completely bypass permission checks
        register_rest_route(self::REST_NAMESPACE, self::REST_CHAT_ROUTE, [
            'methods' => 'POST',
            'callback' => [$this, 'rest_chat_handler'],
            'permission_callback' => '__return_true',  // Completely public
            'args' => [
                'message' => [
                    'type' => 'string',
                    'required' => true,
                    'sanitize_callback' => 'sanitize_text_field',
                ],
                'sessionId' => [
                    'type' => 'string',
                    'sanitize_callback' => 'sanitize_text_field',
                ],
            ],
        ]);

        // Test endpoint - admin only
        register_rest_route(self::REST_NAMESPACE, self::REST_TEST_ROUTE, [
            'methods' => 'POST',
            'callback' => [$this, 'rest_test_handler'],
            'permission_callback' => '__return_true',  // Check admin status inside handler
        ]);
    }


    /**
     * Require admin capability for REST endpoint
     */
    public function rest_require_admin() {
        return current_user_can('manage_options');
    }

    /**
     * REST API Chat Handler
     */
    public function rest_chat_handler($request) {
        // Optional basic Origin/Referer protection (same-site only by default)
        if (!$this->origin_allowed()) {
            return new \WP_Error(
                'forbidden_origin',
                'Forbidden origin.',
                ['status' => 403]
            );
        }

        $message = $request->get_param('message');
        $message = trim((string)$message);

        if ($message === '' || strlen($message) > 4000) {
            return new \WP_Error(
                'invalid_message',
                'Invalid message.',
                ['status' => 400]
            );
        }

        $sessionId = $request->get_param('sessionId');
        if ($sessionId === '' || empty((string)$sessionId)) {
            if (function_exists('wp_generate_uuid4')) {
                $sessionId = wp_generate_uuid4();
            } else {
                if (function_exists('random_bytes')) {
                    try {
                        $sessionId = bin2hex(random_bytes(16));
                    } catch (Exception $e) {
                        $sessionId = uniqid('', true);
                    }
                } else {
                    $sessionId = uniqid('', true);
                }
            }
        }

        // Rate limiting
        $ip = isset($_SERVER['REMOTE_ADDR']) ? sanitize_text_field(wp_unslash($_SERVER['REMOTE_ADDR'])) : '0.0.0.0';
        if (!$this->rate_limit_ok($ip)) {
            return new \WP_Error(
                'rate_limit_exceeded',
                'Rate limit exceeded. Please slow down.',
                ['status' => 429]
            );
        }

        // Get webhook configuration
        $endpoint = trim((string)get_option(self::OPT_ENDPOINT, ''));
        if (!$endpoint && function_exists('get_site_option')) {
            $endpoint = trim((string)get_site_option(self::OPT_ENDPOINT, ''));
        }
        if (!$endpoint && defined('WPAICB_ENDPOINT')) {
            $endpoint = trim((string)WPAICB_ENDPOINT);
        }

        if ($endpoint === '') {
            return new \WP_Error(
                'endpoint_not_configured',
                'Webhook endpoint not configured.',
                ['status' => 500]
            );
        }

        if (!preg_match('#^[a-z][a-z0-9+.-]*://#i', $endpoint)) {
            $endpoint = 'https://' . $endpoint;
        }

        if (!wp_http_validate_url($endpoint) || strtolower((string)wp_parse_url($endpoint, PHP_URL_SCHEME)) !== 'https') {
            return new \WP_Error('invalid_endpoint', 'HTTPS webhook endpoint required.', ['status' => 500]);
        }
        $authName = get_option(self::OPT_AUTH_NAME, 'Authorization');
        $authValue = get_option(self::OPT_AUTH_VALUE, '');

        $headers = [
            'Content-Type' => 'application/json; charset=utf-8',
            'X-Chat-Session' => $sessionId,
        ];
        if ($authName && $authValue) {
            $headers[$authName] = $authValue;
        }

        $payload = [
            'message' => $message,
            'sessionId' => $sessionId,
        ];

        // Make the remote request to the webhook
        // Note: RAG queries may take longer, so we use a longer timeout
        $res = @wp_remote_post($endpoint, [
            'headers' => $headers,
            'body' => wp_json_encode($payload),
            'timeout' => 60, // Increased from 30 to allow RAG queries
            'sslverify' => true,
            'redirection' => 0,
            'reject_unsafe_urls' => true, // Prevent unsafe redirect and private network targets
        ]);

        if (is_wp_error($res)) {
            $error_msg = $res->get_error_message();
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('WPAICB: wp_remote_post error: ' . $error_msg);
            }
            return new \WP_Error(
                'remote_request_failed',
                'Upstream chatbot temporarily unavailable.',
                ['status' => 502]
            );
        }

        $code = (int)wp_remote_retrieve_response_code($res);
        if (!$code) {
            $code = 200;
        }
        
        $body = wp_remote_retrieve_body($res);
        $ct = wp_remote_retrieve_header($res, 'content-type');

        // Ensure body is a clean string
        if (!is_string($body)) {
            $body = '';
        }
        
        $body = trim($body);
        
        // Remove UTF-8 BOM if present
        if (strpos($body, "\xEF\xBB\xBF") === 0) {
            $body = substr($body, 3);
        }

        return new \WP_REST_Response([
            'status' => $code,
            'contentType' => $ct ? (string)$ct : 'text/plain',
            'body' => $body,
            'sessionId' => $sessionId,
        ], 200);
    }

    /**
     * REST API Test Handler (Admin only)
     */
    public function rest_test_handler($request) {
        // Check admin capability inside handler (since permission_callback uses __return_true)
        if (!current_user_can('manage_options')) {
            return new \WP_Error(
                'insufficient_permissions',
                'Only administrators can test the webhook',
                ['status' => 403]
            );
        }
        
        $endpoint = trim((string)get_option(self::OPT_ENDPOINT, ''));
        if (!$endpoint && function_exists('get_site_option')) {
            $endpoint = trim((string)get_site_option(self::OPT_ENDPOINT, ''));
        }
        if (!$endpoint && defined('WPAICB_ENDPOINT')) {
            $endpoint = trim((string)WPAICB_ENDPOINT);
        }

        if ($endpoint === '') {
            return new \WP_Error(
                'endpoint_not_configured',
                'No endpoint configured',
                ['status' => 400]
            );
        }

        if (!preg_match('#^[a-z][a-z0-9+.-]*://#i', $endpoint)) {
            $endpoint = 'https://' . $endpoint;
        }

        $authName = get_option(self::OPT_AUTH_NAME, 'Authorization');
        $authValue = get_option(self::OPT_AUTH_VALUE, '');

        $headers = ['Content-Type' => 'application/json; charset=utf-8'];
        if ($authName && $authValue) {
            $headers[$authName] = $authValue;
        }

        $payload = ['test' => true, 'ts' => time()];

        $res = wp_remote_post($endpoint, [
            'headers' => $headers,
            'body' => wp_json_encode($payload),
            'timeout' => 15,
            'sslverify' => true,
            'redirection' => 0,
            'reject_unsafe_urls' => true,
        ]);

        if (is_wp_error($res)) {
            return new \WP_Error(
                'remote_request_failed',
                $res->get_error_message(),
                ['status' => 502]
            );
        }

        $code = wp_remote_retrieve_response_code($res);
        $body = wp_remote_retrieve_body($res);
        $summary = is_string($body) ? trim(preg_replace('/\s+/', ' ', substr($body, 0, 512))) : '';

        return new \WP_REST_Response([
            'status' => (int)$code,
            'summary' => $summary,
        ], 200);
    }

    public function enqueue_assets() {
        // Load only when shortcode is present could be optimized with block/shortcode detection.
        $css_path = WPAICB_PLUGIN_DIR . 'assets/wpaicb.css';
        $js_path  = WPAICB_PLUGIN_DIR . 'assets/wpaicb.js';
        $css_ver  = file_exists($css_path) ? (string) @filemtime($css_path) : WPAICB_VERSION;
        $js_ver   = file_exists($js_path)  ? (string) @filemtime($js_path)  : WPAICB_VERSION;

        wp_register_style('wpaicb-style', WPAICB_PLUGIN_URL . 'assets/wpaicb.css', [], $css_ver);
        wp_register_script('wpaicb-script', WPAICB_PLUGIN_URL . 'assets/wpaicb.js', [], $js_ver, true);
    }

    public function shortcode($atts = []) {
        wp_enqueue_style('wpaicb-style');
        wp_enqueue_script('wpaicb-script');

        $atts = shortcode_atts([
            'height' => '520',
            'title'  => '',
            'hint'   => 'Tip: try "find posts about proxmox".',
        ], $atts, 'wp_ai_chatbot');

        $height = intval($atts['height']);
        if ($height < 320) $height = 320;
        if ($height > 900) $height = 900;

        // Build REST API endpoint URL
        // Use rest_url() if available, otherwise construct it manually
        if (function_exists('rest_url')) {
            $rest_url = rest_url(self::REST_NAMESPACE . self::REST_CHAT_ROUTE);
        } else {
            // Fallback: construct manually
            $rest_url = home_url('/wp-json/' . self::REST_NAMESPACE . self::REST_CHAT_ROUTE);
        }

        // Ensure we have a valid URL
        if (empty($rest_url) || $rest_url === 'undefined') {
            $rest_url = home_url('/wp-json/' . self::REST_NAMESPACE . self::REST_CHAT_ROUTE);
        }

        $site_home = esc_url_raw(get_option(self::OPT_SITE_HOME, home_url('/')));

        ob_start(); ?>
        <script>
        if (typeof WPAICB === 'undefined') {
            window.WPAICB = {
                restUrl: <?php echo wp_json_encode($rest_url); ?>,
                siteHome: <?php echo wp_json_encode($site_home); ?>
            };
            console.log('WPAICB initialized:', window.WPAICB);

            // Diagnostic: Test REST API health endpoint
            (function() {
                const healthUrl = <?php echo wp_json_encode(home_url('/wp-json/' . self::REST_NAMESPACE . '/health')); ?>;
                console.log('WPAICB: Testing REST API health at:', healthUrl);
                fetch(healthUrl)
                    .then(r => r.json())
                    .then(d => console.log('WPAICB: REST API health check passed:', d))
                    .catch(e => console.error('WPAICB: REST API health check failed:', e));
            })();
        }
        </script>
        <div class="wpaicb-wrap" data-wpaicb="1">
            <?php if (!empty($atts['title'])): ?>
            <h3 class="wpaicb-title"><?php echo esc_html($atts['title']); ?></h3>
            <?php endif; ?>
            <div class="wpaicb-chat" style="height: <?php echo esc_attr($height); ?>px"></div>

            <div class="wpaicb-bar">
                <input class="wpaicb-msg" type="text" placeholder="Type…" autocomplete="off" />
                <button class="wpaicb-send" type="button">Send</button>
            </div>
            <div class="wpaicb-hint"><?php echo esc_html($atts['hint']); ?></div>
        </div>
        <?php
        return ob_get_clean();
    }

    public function admin_menu() {
        add_options_page(
            'WP AI Chatbot',
            'WP AI Chatbot',
            'manage_options',
            'wpaicb-settings',
            [$this, 'settings_page']
        );
    }

    public function register_settings() {
        register_setting('wpaicb_settings', self::OPT_ENDPOINT, [
            'type' => 'string',
            'sanitize_callback' => function($v) {
                $v = trim((string)$v);
                if ($v === '') return '';
                // If user omitted scheme, assume https and keep the value.
                if (!preg_match('#^[a-z][a-z0-9+.-]*://#i', $v)) {
                    $v = 'https://' . $v;
                }
                return esc_url_raw($v, ['https']);
            },
            'default' => '',
        ]);

        register_setting('wpaicb_settings', self::OPT_AUTH_NAME, [
            'type' => 'string',
            'sanitize_callback' => function($v) {
                $v = preg_replace('/[^A-Za-z0-9\-]/', '', (string)$v);
                return $v ?: 'Authorization';
            },
            'default' => 'Authorization',
        ]);

        register_setting('wpaicb_settings', self::OPT_AUTH_VALUE, [
            'type' => 'string',
            'sanitize_callback' => function($v) {
                // Do not over-sanitize; allow "Bearer ..." etc. Just trim.
                return trim((string)$v);
            },
            'default' => '',
        ]);

        register_setting('wpaicb_settings', self::OPT_SITE_HOME, [
            'type' => 'string',
            'sanitize_callback' => function($v) {
                $v = trim((string)$v);
                return $v ? esc_url_raw($v) : esc_url_raw(home_url('/'));
            },
            'default' => '',
        ]);
    }

    public function settings_page() {
        if (!current_user_can('manage_options')) return;

        $endpoint = esc_url(get_option(self::OPT_ENDPOINT, ''));
        $hname = esc_html(get_option(self::OPT_AUTH_NAME, 'Authorization'));
        $hval = esc_html(get_option(self::OPT_AUTH_VALUE, ''));
        $site = esc_url(get_option(self::OPT_SITE_HOME, home_url('/')));

        ?>
        <div class="wrap">
            <h1>WP AI Chatbot</h1>
            <p>This plugin embeds a chatbot UI and securely proxies requests to your n8n webhook (so your webhook secret is never exposed in the browser).</p>

            <form method="post" action="options.php">
                <?php settings_fields('wpaicb_settings'); ?>
                <table class="form-table" role="presentation">
                    <tr>
                        <th scope="row"><label for="wpaicb_endpoint">n8n Webhook URL</label></th>
                        <td>
                            <input name="<?php echo esc_attr(self::OPT_ENDPOINT); ?>" id="wpaicb_endpoint" type="url" class="regular-text" value="<?php echo $endpoint; ?>" placeholder="https://automation.example.com/webhook/wp-ai-chatbot" />
                            <p class="description">Your n8n webhook endpoint (HTTPS recommended).</p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"><label for="wpaicb_auth_header_name">Auth header name</label></th>
                        <td>
                            <input name="<?php echo esc_attr(self::OPT_AUTH_NAME); ?>" id="wpaicb_auth_header_name" type="text" class="regular-text" value="<?php echo $hname; ?>" placeholder="Authorization" />
                            <p class="description">Example: <code>Authorization</code>.</p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"><label for="wpaicb_auth_header_value">Auth header value</label></th>
                        <td>
                            <input name="<?php echo esc_attr(self::OPT_AUTH_VALUE); ?>" id="wpaicb_auth_header_value" type="password" class="regular-text" value="<?php echo $hval; ?>" placeholder="Bearer YOUR_WEBHOOK_TOKEN" autocomplete="new-password" />
                            <p class="description">Example: <code>Bearer ABC123</code>. Stored in WordPress options.</p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"><label for="wpaicb_site_home">Site home URL</label></th>
                        <td>
                            <input name="<?php echo esc_attr(self::OPT_SITE_HOME); ?>" id="wpaicb_site_home" type="url" class="regular-text" value="<?php echo $site; ?>" placeholder="<?php echo esc_attr(home_url('/')); ?>" />
                            <p class="description">Used only for a small UI heuristic (optional).</p>
                        </td>
                    </tr>
                </table>
                <?php submit_button('Save settings'); ?>
            </form>

                        <p>
                                <button id="wpaicb-test" class="button">Test webhook</button>
                                <span id="wpaicb-test-result" style="margin-left:12px"></span>
                        </p>
                        <script>
                        (function(){
                                const btn = document.getElementById('wpaicb-test');
                                const out = document.getElementById('wpaicb-test-result');
                                btn.addEventListener('click', function(){
                                        btn.disabled = true; out.textContent = 'Testing…';
                                        const ajaxUrl = '<?php echo admin_url('admin-ajax.php'); ?>';
                                        const data = new FormData();
                                        data.append('action', 'wpaicb_test');
                                        fetch(ajaxUrl, {
                                            method: 'POST',
                                            credentials: 'same-origin',
                                            body: data
                                        })
                                            .then(r => r.json())
                                            .then(d => {
                                                btn.disabled = false;
                                                if (!d || d.success !== true) {
                                                    out.textContent = 'Error: ' + (d?.data?.error || d?.message || 'Unexpected');
                                                    return;
                                                }
                                                const info = d.data;
                                                out.textContent = 'HTTP ' + info.status + ' — ' + (info.summary || '').slice(0,200);
                                            })
                                            .catch(e => { btn.disabled = false; out.textContent = 'Network error'; });
                                });
                        })();
                        </script>

            <hr />
            <h2>Usage</h2>
            <p>Add this shortcode to a page (including inside Nicepage content):</p>
            <pre>[wp_ai_chatbot height="520" hint="Tip: try "find posts about proxmox"."]</pre>
        </div>
        <?php
    }

    private function rate_limit_ok($ip) {
        // Soft rate limit: 60 requests / 10 minutes per IP
        $key = 'wpaicb_rl_' . md5($ip);
        $data = get_transient($key);
        if (!is_array($data)) $data = ['count' => 0, 'start' => time()];

        $window = 10 * 60;
        if ((time() - $data['start']) > $window) {
            $data = ['count' => 0, 'start' => time()];
        }

        $data['count']++;
        set_transient($key, $data, $window);

        return ($data['count'] <= 60);
    }

    public function ajax_send() {
        // Public endpoint: no nonce required
        // Create a REST request object to delegate to the REST handler
        $request = new \WP_REST_Request('POST', '/wpaicb/v1/chat');
        $request->set_param('message', isset($_POST['message']) ? wp_unslash($_POST['message']) : '');
        $request->set_param('sessionId', isset($_POST['sessionId']) ? sanitize_text_field(wp_unslash($_POST['sessionId'])) : '');
        
        $response = $this->rest_chat_handler($request);

        if (is_wp_error($response)) {
            wp_send_json_error(['error' => $response->get_error_message()], $response->get_error_data()['status'] ?? 400);
        }

        // Convert WP_REST_Response to AJAX response format
        $data = $response->get_data();
        wp_send_json_success($data, 200);
    }

    public function ajax_test() {
        if (!current_user_can('manage_options')) {
            wp_send_json_error(['error' => 'Forbidden'], 403);
        }

        // Create a REST request object to delegate to the REST handler
        $request = new \WP_REST_Request('POST', '/wpaicb/v1/test');
        
        $response = $this->rest_test_handler($request);

        if (is_wp_error($response)) {
            wp_send_json_error(['error' => $response->get_error_message()], $response->get_error_data()['status'] ?? 400);
        }

        // Convert WP_REST_Response to AJAX response format
        $data = $response->get_data();
        wp_send_json_success($data, 200);
    }

    private function origin_allowed() {
        // Allow site origin by default; can be overridden via filter
        $allowed = apply_filters('wpaicb_enforce_origin_check', true);
        if (!$allowed) return true;

        $site = get_option(self::OPT_SITE_HOME, home_url('/'));
        $site_host = parse_url($site, PHP_URL_HOST);

        $origin = isset($_SERVER['HTTP_ORIGIN']) ? trim((string)$_SERVER['HTTP_ORIGIN']) : '';
        $referer = isset($_SERVER['HTTP_REFERER']) ? trim((string)$_SERVER['HTTP_REFERER']) : '';

        $check = $origin ?: $referer;
        if ($check === '') return true; // no header provided

        $host = parse_url($check, PHP_URL_HOST);
        if (!$host || !$site_host) return true; // fallback allow

        return (strcasecmp($host, $site_host) === 0);
    }
}
