const pluginRss = require("@11ty/eleventy-plugin-rss");
const CleanCSS = require('clean-css');

module.exports = function(eleventyConfig) {
  eleventyConfig.addPlugin(pluginRss);
  eleventyConfig.addPassthroughCopy("css");

  eleventyConfig.addFilter("cssmin", function(code) {
    return new CleanCSS({}).minify(code).styles;
  });
  eleventyConfig.addShortcode("buildIpfsUrl", function(urlFragment) {
    return `//ipfs.io/ipfs/${urlFragment}`;
  });
  return {
    dir: {
      input: ".",
      includes: "_includes",
      data: "_data",
      output: "dist"
    }
  }
}
