//to register all of our plugins with file filepond
FilePond.registerPlugin(
  FilePondPluginImagePreview,
  FilePondPluginImageResize,
  FilePondPluginFileEncode,
)
//to align the preview with exact size of the book
FilePond.setOptions({
  stylePanelAspectRatio: 150 / 100,
  imageResizeTargetWidth: 100,
  imageResizeTargetHeight: 150
})
//this is going to turn all file inputs in our entire page into filepond objects
FilePond.parse(document.body);
