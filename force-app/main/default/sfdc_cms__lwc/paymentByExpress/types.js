export let ExpressMode = function (ExpressMode) {
  ExpressMode[ExpressMode["DEFAULT"] = 0] = "DEFAULT";
  ExpressMode[ExpressMode["PDP"] = 1] = "PDP";
  ExpressMode[ExpressMode["MINICART"] = 2] = "MINICART";
  ExpressMode[ExpressMode["CART"] = 3] = "CART";
  ExpressMode[ExpressMode["CHECKOUT"] = 4] = "CHECKOUT";
  return ExpressMode;
}({});