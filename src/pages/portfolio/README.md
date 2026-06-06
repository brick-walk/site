# How to Use the Portfolio Organization System

Here is the boilerplate example I put into every file. 
The `src` property is the image path. Make sure it's set to a valid file path and the `/` before `images` must be there.
The `views` property must have file paths to all of the other views that should be displayed when the image is clicked. The same format as with the `src` must be used. The last image path cannot have a comma after it.
The `title` is the image title. This will be the alt-text if the image cannot be loaded and the title shown when the image is clicked.
The `description` is the image description that will be shown when the image is clicked.
```json
{
	"images": [
		{
			"src": "/images/portfolio/legolas_build.png",
            "views": ["/images/portfolio/legolas_build.png", "/images/portfolio/legolas_build.png", "/images/portfolio/legolas_build.png"],
			"title": "Legolas",
			"description": "Describe your build here"
		},
		{
			"src": "/images/portfolio/steampunk_inventor_build.png",
            "views": ["/images/portfolio/steampunk_inventor_build.png", "/images/portfolio/steampunk_inventor_build.png", "/images/portfolio/steampunk_inventor_build.png"],
			"title": "Steampunk Inventor",
			"description": "Describe your build here"
		},
		{
			"src": "/images/portfolio/zane_build.png",
            "views": ["/images/portfolio/zane_build.png", "/images/portfolio/zane_build.png", "/images/portfolio/zane_build.png"],
			"title": "Zane",
			"description": "Describe your build here"
		}
	]
}
```
