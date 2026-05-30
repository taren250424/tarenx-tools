import "./view.scss"
import { init as initMain } from "./main/main"
import { init as initHeader } from "./header/header"
import { init as initFooter } from "./footer/footer"

export function init() {
	initMain()
	initHeader()
	initFooter()
}
