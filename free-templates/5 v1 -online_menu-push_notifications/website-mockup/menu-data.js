// Menu data — edit via admin.html or manually
// ─────────────────────────────────────────────────────────────────
// orderWebhook: set this to your n8n webhook URL
//   e.g. "https://n8n.yourdomain.com/webhook/menu"
// ─────────────────────────────────────────────────────────────────
window.MENU_DATA = {
  "title": "Your Restaurant",
  "orderWebhook": "https://YOUR_N8N_DOMAIN/webhook/menu",
  "sections": [
    {
      "id": "beers",
      "title": "Beers",
      "items": [
        { "name": "Blonde Lager", "description": "Light and crisp", "detail": "33cl", "link": "" },
        { "name": "Amber Ale", "description": "Smooth malt profile", "detail": "33cl", "link": "" },
        { "name": "Session Pils", "description": "Dry and refreshing", "detail": "50cl", "link": "" }
      ]
    },
    {
      "id": "aperitifs",
      "title": "Aperitifs",
      "items": [
        { "name": "Citrus Spritz", "description": "Sparkling wine, citrus, soda", "detail": "", "link": "" },
        { "name": "Bitter Spritz", "description": "Sparkling wine, bitter herbs, soda", "detail": "", "link": "" },
        { "name": "Sparkling Wine", "description": "Dry and delicate", "detail": "", "link": "" }
      ]
    },
    {
      "id": "soft-drinks",
      "title": "Soft Drinks",
      "items": [
        { "name": "Cola", "description": "Classic sparkling soft drink", "detail": "33cl", "link": "" },
        { "name": "Tonic Water", "description": "Bitter and bubbly", "detail": "", "link": "" },
        { "name": "Energy Drink", "description": "Lightly sparkling", "detail": "", "link": "" }
      ]
    },
    {
      "id": "cocktails",
      "title": "Cocktails",
      "items": [
        { "name": "Botanical Highball", "description": "Distillate, tonic water, citrus", "detail": "", "link": "", "variants": ["Dry", "Floral"] },
        { "name": "Clear Spirit Highball", "description": "Clear spirit, tonic water, lime", "detail": "", "link": "" },
        { "name": "Herbal Bitter Mix", "description": "Botanical spirit, bitter herbs, vermouth", "detail": "", "link": "" },
        { "name": "Spiced Cola Mix", "description": "Dark spirit, cola, lime", "detail": "", "link": "" }
      ]
    }
  ]
};
