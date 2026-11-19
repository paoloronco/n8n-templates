# Shared Social Studio worker

The [Social Studio worker source](./social-studio-worker/) is shared by the local V1 templates:

- [Posts and Carousels V1 setup](../social-posts-carousels/V1/documentation.md)
- [Reels and Shorts V1 setup](../social-reels-shorts/V1/documentation.md)

Copy the complete `social-studio-worker/` directory, including `assets/`, `package.json` and `package-lock.json`, to your separate worker host. Follow the guide for your selected workflow before installing dependencies or starting the service. Importing a workflow JSON does not install its companion worker. The cloud V2 templates use their own n8n Runtime sub-workflows instead.
