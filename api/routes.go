package main

import (

	"github.com/gorilla/mux"
)

func setupRoutes(r *mux.Router) {
	r.HandleFunc("/health", hHealth).Methods("GET")
	r.HandleFunc("/config", hConfig2).Methods("GET")

	r.HandleFunc("/goto", hGoto).Methods("POST")
	r.HandleFunc("/reload", hReload).Methods("POST")
	r.HandleFunc("/back", hBack).Methods("POST")
	r.HandleFunc("/forward", hForward).Methods("POST")
	r.HandleFunc("/wait/ready", hWaitReady).Methods("POST")
	r.HandleFunc("/wait/visible", hWaitVisible).Methods("POST")
	r.HandleFunc("/wait/hidden", hWaitHidden).Methods("POST")

	r.HandleFunc("/dom/query", hQuerySelector).Methods("POST")
	r.HandleFunc("/dom/query-all", hQuerySelectorAll).Methods("POST")
	r.HandleFunc("/dom/count", hCount2).Methods("POST")
	r.HandleFunc("/dom/visible", hIsVisible).Methods("POST")
	r.HandleFunc("/dom/get-attribute", hGetAttribute).Methods("POST")
	r.HandleFunc("/dom/set-attribute", hSetAttribute).Methods("POST")
	r.HandleFunc("/dom/get-html", hGetHTML).Methods("POST")
	r.HandleFunc("/dom/insert-html", hInsertHTML).Methods("POST")
	r.HandleFunc("/dom/remove", hRemoveElement).Methods("POST")
	r.HandleFunc("/dom/get-text", hGetText).Methods("POST")
	r.HandleFunc("/dom/get-styles", hGetStyles).Methods("POST")
	r.HandleFunc("/dom/get-rect", hGetRect).Methods("POST")
	r.HandleFunc("/dom/add-class", hAddClass).Methods("POST")
	r.HandleFunc("/dom/remove-class", hRemoveClass).Methods("POST")
	r.HandleFunc("/dom/focus", hFocus).Methods("POST")
	r.HandleFunc("/dom/blur", hBlur).Methods("POST")

	r.HandleFunc("/click", hClick).Methods("POST")
	r.HandleFunc("/double-click", hDoubleClick).Methods("POST")
	r.HandleFunc("/type", hType).Methods("POST")
	r.HandleFunc("/clear", hClear).Methods("POST")
	r.HandleFunc("/select", hSelect).Methods("POST")
	r.HandleFunc("/hover", hHover).Methods("POST")
	r.HandleFunc("/mouse/move", hMouseMove).Methods("POST")
	r.HandleFunc("/scroll", hScroll).Methods("POST")
	r.HandleFunc("/key", hPressKey).Methods("POST")
	r.HandleFunc("/upload", hUploadFile).Methods("POST")

	r.HandleFunc("/cookies", hGetCookies).Methods("GET")
	r.HandleFunc("/cookies/set", hSetCookie).Methods("POST")
	r.HandleFunc("/cookies/delete", hDeleteCookie).Methods("POST")

	r.HandleFunc("/js/execute", hExecuteJS).Methods("POST")
	r.HandleFunc("/screenshot", hScreenshot).Methods("POST")

	r.HandleFunc("/info/url", hGetURL).Methods("GET")
	r.HandleFunc("/info/title", hGetTitle).Methods("GET")
	r.HandleFunc("/info/body/text", hGetText2).Methods("GET")
	r.HandleFunc("/info/body/html", hGetHTML2).Methods("GET")
	r.HandleFunc("/info/full/html", hGetFullHTML).Methods("GET")
	r.HandleFunc("/info/fingerprint", hGetFingerprint).Methods("GET")
	r.HandleFunc("/info/anti-bot", hGetAntiBot).Methods("GET")

	r.HandleFunc("/storage/local", hGetLocalStorage).Methods("GET")
	r.HandleFunc("/storage/local/set", hSetLocalStorage).Methods("POST")
	r.HandleFunc("/storage/local/clear", hClearLocalStorage).Methods("POST")

	r.HandleFunc("/warmup", hWarmup).Methods("POST")
}
