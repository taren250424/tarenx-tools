import "../../shared/footer/site-footer.css";
import "../../shared/ads/ad-slot.css";
import { init as initView } from "./ui/view";

function main() {
  initView();
}

document.addEventListener("DOMContentLoaded", main);
