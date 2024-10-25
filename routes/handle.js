const router = require("express").Router();

router.get("/", (req, res) => {
  res.render("handle.ejs");
});

router.get("/:trunk", (req, res) => {
  res.render("trunk.ejs");
});

module.exports = router;
