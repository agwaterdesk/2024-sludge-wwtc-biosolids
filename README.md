# Svelte template

## To get started

### Using degit

`degit` is a package that makes copies of a git repository's most recent commit. This allows for generating the scaffolding from this template directly from the command line.

Since this is a private repository, you'll need to set up SSH keys with your Github account. More information on how to do that [here](https://docs.github.com/en/github/authenticating-to-github/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent).

To install degit: `npm install -g degit`

To create a new project based on this template using [degit](https://github.com/Rich-Harris/degit):

```bash
npx degit axiosvisuals/svelte-template --mode=git test-app
cd test-app
```

### Using 'Use this template'

Click the `Use this template` button above and follow the instructions prompted by GitHub.

### Post-clone setup

In your local repo:

- Install the dependencies: `npm install`
- Ctrl+F the term `[insert slug]` and replace it with your project slug. Also update the page title by ctrl+F'ing `[insert name]` and replacing it with a project name. (Or, you can manually update these in `index.html` and `project.config.json`.)
- Start the development server: `npm run dev`
- Navigate to [localhost:3000](http://localhost:3000). The app should run and update on changes.

## Google Docs/Archie ML for copy

- Create a Google Doc or Sheet
- Click Share button -> advanced -> Change... -> to "Anyone with this link"
- In the address bar, grab the ID - eg. ...com/document/d/**1IiA5a5iCjbjOYvZVgPcjGzMy5PyfCzpPF-LnQdCdFI0**/edit
  paste in the ID above into `project.config.json`, and set the filepath to where you want the file saved
- If you want to do a Google Sheet, be sure to include the gid value in the url as well
- Running `npm run fetch-doc` at any point (even in new tab while server is running) will fetch the latest from all Docs and Sheets.
- Make sure any elements that include this copy use [@html](https://svelte.dev/tutorial/html-tags), so links/styling from the google doc can be properly incorporated

## Publishing

- Before publishing please make sure to fill out the `[alt text]` in `App.svelte`
- Make sure your changes are committed to `main`
- `npm run publish` will push to `main`, build the app, and then deploy the built version to the S3 bucket specified in `project.config.json`
  - You'll be prompted to see if you want to generate fallbacks (for this to work, you'll need to have [localhost:3000](http://localhost:3000) running in another tab), they'll go in `public/fallbacks`
  - See the documentation for [modifying fallbacks](#modifying-the-fallback-images) below for details

### Setting up your shell profile file

The Slackbot ping script relies on you adding your Axios email to your `.zshrc` file (assuming you're using MacOS Catalina or later). If you're still using bash, you'll want to add to `.bashrc` Here's how to do that:

- Open up your terminal and type `vim .zshrc` / `vim .bashrc` this opens the profile file in a text editor.
- Type `i` to allow for typing.
- Add this line somewhere in the file and replace your Axios email: `export EMAIL_AXIOS="YOUR_EMAIL_GOES_HERE"`.
- Hit `esc` then `Shift + ;`, `w` and `q` and then `Enter`.
- Restart your terminal so that the new environment variable is active.

## Batch publishing

### Javascript

At times you will need to publish multiple versions of a Svelte project, most of these instances will be with different annotations.

To show the different annotations using only one web project, pass a querystring parameter. The following snippet reads the querystring and allows access to a function to parse it.

```
  const queryString = window.location.search.slice(1);
  let searchParams = new URLSearchParams(queryString)

  // get parameter
  searchParams.get('desired_key_here')
```

The querystring parameter has to directly manipulate or impact the data being visualized. [See the airport waiting times beeswarm](https://github.com/axiosvisuals/2022-04-06-airport-waiting-times), for an example.

### Project setup

In `project.config.json` add two new properties in the `project` object along with `name` and `slug`: `series` and `queryStringVar`. The value of `series` should be an array of the querystring parameters you want to loop through. The value of `queryStringVar` should be whatever variable the project looks for. For example in the url `axios.com/?local=Twin Cities`, the value should be local.

After adding the `series` array, run `npm run dev` to get a local serving running as usual. Run `npm run batch-publish` to start the batch publishing process. This gulp task takes fallbacks for each item in the series, publishes them to S3 in individual folders and writes a csv file to `./batches/output.csv` containing the series item name, embed link and social fallback link.

### Alt text

By default, all items in a batch will use the alt text specified in the `alt` field in `project.config.json` file. However, you can specify alt text for individual items in a batch by providing data in `src/data/batchAlt.json`. The item keys should match the items listed in the `series` array. You **do not** need to include all items; any items with no individual alt text provided will use the default alt text.

```json
{
  "Item1": "Individual alt text goes here",
  "Item2": "Individual alt text goes here"
  // etc.
}
```

You'll also need to make a small modification to `App.svelte` to include the batch alt text.

```svelte
<script>
  // Import the batch alt text data file
  import batchAlt from "./data/batchAlt.json"

  // You still want to include the default altText
  //@ts-ignore; Pull in the alt text from `project.config.json`. See README for details & how to handle for batches
  const altText = __ALT_TEXT__;

  // Do your search query parameter stuff here to get the current local
  let currentLocal = searchParams.get('desired_key_here')
</script>

<!-- This will use the current local's alt text if it exists in batchAlt, otherwise the default will be used. -->
<p class="sr-only">{batchAlt[currentLocal] || altText}</p>
```

## Batch publishing for static images

A component for times when flat images are all you need – but you have a lot of them. Typically the publication method for a batch of plots created in `ggplot2 `.

This is an extension of the main batch publishing method. See **Batch publishing** above for more information.

### Setup

1. For every local, there should be separate appropriately sized images for each breakpoint. Images should follow the `ai2html` naming convention and use snakecase to separate multi-word series names:
   - `[series_id]-desktop.png`
   - `national-large.png`
   - `North_Carolina-small.png`
   - `Philadelphia-tablet.png`
2. Place images in `public/images`.
3. Within `App.svelte`, import `components/StaticApp.svelte` and add it to the chart container. This component includes the hed and dek so remove these from `App.svelte`.
4. Customize `StaticApp.svelte` as needed, including the hed, dek and legend. The `{local}` value is determined by a url param. For more information, see **Batch publishing → Project setup**.
5. Run `gulp seriesFromImages` to set the `series` array and `queryStringVar ` in `project.config.json`. The script iterates over the files in `public/images`, makes a unique array, and edits the config file. `queryStringVar` defaults to `local` but can be modified as needed.
6. Run `npm run batch-publish` to start the batch publishing process. This will task takes fallbacks for each item in the series, publishes them to S3 in individual folders and writes a csv file to `./batches/output.csv` containing the series item name, embed link and social fallback link.

## Modifying the fallback images

By default, the fallback image script will capture the entire area of `.chart-container`. However, if you need more control over the fallback images, there are several things you can do.

- If you do not want to include an element in the fallback images, you can add `class="hide-in-static"` to it to exclude it from the static image. Elements with this class added will be set to `display: none`.

- When a screenshot is being taken, `.chart-container` is given an additional class of `is-screenshot` and `is-screenshot--[SIZE]`. For example, when the social image is taken the class list will look like `class="chart-container is-screenshot is-screenshot--social`. You can use this to modify the appearance of your graphic when screenshots are being taken.

### Instagram fallbacks

To be able to create fallback images that meet the square requirements of Instagram, there are some additional ways you can customize Instagram fallbacks.

In `project.config.json`, you can modify the `instaSlides` property. If it has a value greater than 1, it will take multiple Instagram-sized fallbacks.

In addition to having the `is-screenshot is-screenshot--insta` classes, `.chart-container` will also have `data-insta="#"` added to it. This means you can style your graphic per Instagram image with CSS. See the example code below for an idea of how to use this.

```
<div class="chart-container">
  <h1 class="hed">Chart title</h1>
  <p class="dek">Dek</p>
  <div class="visual-1">First visual here</div>
  <div class="visual-2">Second visual here</div>
</div>

<style lang="scss">
  :global {
    .is-screenshot--insta {

      // On first Instagram fallback, hide the 2nd visual
      &[data-insta="0"] {
        .visual-2 {
          display: none;
        }
      }

      // Do the opposite on the second Instagram fallback
      &[data-insta="1"] {
        .visual-1 {
          display: none;
        }
      }
    }
  }
</style>
```
