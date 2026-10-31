<?php
/**
 * Plugin Name: WP AI Chatbot (n8n Webhook)
 * Description: Embed a secure AI chatbot that proxies requests to an n8n webhook. Use shortcode [wp_ai_chatbot].
 * Version: 3.4
 * Author: Custom
 * License: GPLv2 or later
 * Text Domain: wp-ai-chatbot
 */

if (!defined('ABSPATH')) { exit; }

define('WPAICB_VERSION', '3.4');
define('WPAICB_PLUGIN_FILE', __FILE__);
define('WPAICB_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('WPAICB_PLUGIN_URL', plugin_dir_url(__FILE__));

require_once WPAICB_PLUGIN_DIR . 'includes/class-wpaicb-plugin.php';

function wpaicb_boot() {
    $plugin = new WPAICB_Plugin();
    $plugin->init();
}
add_action('plugins_loaded', 'wpaicb_boot');
