package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"

	"github.com/chromedp/chromedp"
)

var browser *Browser

func jsonResp(w http.ResponseWriter, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(data)
}

func decode(r *http.Request, v interface{}) error {
	return json.NewDecoder(r.Body).Decode(v)
}

// Page
func hGoto(w http.ResponseWriter, r *http.Request) {
	var req struct{ URL string `json:"url"`; Warmup bool `json:"warmup"` }
	decode(r, &req)
	if req.Warmup {
		browser.GotoWithWarmup(req.URL)
	} else {
		browser.Goto(req.URL)
	}
	jsonResp(w, map[string]string{"status": "ok", "url": req.URL})
}

func hReload(w http.ResponseWriter, r *http.Request) {
	chromedp.Run(browser.ctx, chromedp.Reload())
	jsonResp(w, map[string]string{"status": "reloaded"})
}

func hBack(w http.ResponseWriter, r *http.Request) {
	chromedp.Run(browser.ctx, chromedp.Evaluate(`history.back()`, nil))
	jsonResp(w, map[string]string{"status": "back"})
}

func hForward(w http.ResponseWriter, r *http.Request) {
	chromedp.Run(browser.ctx, chromedp.Evaluate(`history.forward()`, nil))
	jsonResp(w, map[string]string{"status": "forward"})
}

func hWaitReady(w http.ResponseWriter, r *http.Request) {
	chromedp.Run(browser.ctx, chromedp.WaitReady("body"))
	jsonResp(w, map[string]string{"status": "ready"})
}

func hWaitVisible(w http.ResponseWriter, r *http.Request) {
	var req struct{ Selector string `json:"selector"` }
	decode(r, &req)
	chromedp.Run(browser.ctx, chromedp.WaitVisible(req.Selector))
	jsonResp(w, map[string]string{"status": "visible"})
}

func hWaitHidden(w http.ResponseWriter, r *http.Request) {
	var req struct{ Selector string `json:"selector"` }
	decode(r, &req)
	chromedp.Run(browser.ctx, chromedp.Evaluate(fmt.Sprintf(`(() => { const el = document.querySelector('%s'); return !el || el.offsetParent === null; })()`, req.Selector), nil))
	jsonResp(w, map[string]string{"status": "hidden"})
}

// DOM
func hQuerySelector(w http.ResponseWriter, r *http.Request) {
	var req struct{ Selector string `json:"selector"` }
	decode(r, &req)
	var result string
	chromedp.Run(browser.ctx, chromedp.Evaluate(fmt.Sprintf(`document.querySelector('%s')?.outerHTML || ''`, req.Selector), &result))
	jsonResp(w, map[string]string{"html": result})
}

func hQuerySelectorAll(w http.ResponseWriter, r *http.Request) {
	var req struct{ Selector string `json:"selector"` }
	decode(r, &req)
	var result string
	chromedp.Run(browser.ctx, chromedp.Evaluate(fmt.Sprintf(`JSON.stringify(Array.from(document.querySelectorAll('%s')).map(el => ({tag: el.tagName, text: el.innerText.substring(0,200)})))`, req.Selector), &result))
	jsonResp(w, map[string]string{"elements": result})
}

func hGetAttribute(w http.ResponseWriter, r *http.Request) {
	var req struct{ Selector string `json:"selector"`; Attribute string `json:"attribute"` }
	decode(r, &req)
	var result string
	chromedp.Run(browser.ctx, chromedp.Evaluate(fmt.Sprintf(`document.querySelector('%s')?.getAttribute('%s') || ''`, req.Selector, req.Attribute), &result))
	jsonResp(w, map[string]string{"value": result})
}

func hSetAttribute(w http.ResponseWriter, r *http.Request) {
	var req struct{ Selector string `json:"selector"`; Attribute string `json:"attribute"`; Value string `json:"value"` }
	decode(r, &req)
	chromedp.Run(browser.ctx, chromedp.Evaluate(fmt.Sprintf(`document.querySelector('%s')?.setAttribute('%s', '%s')`, req.Selector, req.Attribute, req.Value), nil))
	jsonResp(w, map[string]string{"status": "set"})
}

func hGetHTML(w http.ResponseWriter, r *http.Request) {
	var req struct{ Selector string `json:"selector"` }
	decode(r, &req)
	sel := req.Selector
	if sel == "" {
		sel = "body"
	}
	var result string
	chromedp.Run(browser.ctx, chromedp.Evaluate(fmt.Sprintf(`document.querySelector('%s')?.innerHTML || ''`, sel), &result))
	jsonResp(w, map[string]string{"html": result})
}

func hGetText(w http.ResponseWriter, r *http.Request) {
	var req struct{ Selector string `json:"selector"` }
	decode(r, &req)
	sel := req.Selector
	if sel == "" {
		sel = "body"
	}
	var result string
	chromedp.Run(browser.ctx, chromedp.Evaluate(fmt.Sprintf(`document.querySelector('%s')?.innerText || ''`, sel), &result))
	jsonResp(w, map[string]string{"text": result})
}

func hGetStyles(w http.ResponseWriter, r *http.Request) {
	var req struct{ Selector string `json:"selector"`; Property string `json:"property"` }
	decode(r, &req)
	var result string
	chromedp.Run(browser.ctx, chromedp.Evaluate(fmt.Sprintf(`getComputedStyle(document.querySelector('%s')).getPropertyValue('%s')`, req.Selector, req.Property), &result))
	jsonResp(w, map[string]string{"value": result})
}

func hGetRect(w http.ResponseWriter, r *http.Request) {
	var req struct{ Selector string `json:"selector"` }
	decode(r, &req)
	var result string
	chromedp.Run(browser.ctx, chromedp.Evaluate(fmt.Sprintf(`JSON.stringify(document.querySelector('%s')?.getBoundingClientRect())`, req.Selector), &result))
	jsonResp(w, map[string]string{"rect": result})
}

func hCount(w http.ResponseWriter, r *http.Request) {
	var req struct{ Selector string `json:"selector"` }
	decode(r, &req)
	var count int
	chromedp.Run(browser.ctx, chromedp.Evaluate(fmt.Sprintf(`document.querySelectorAll('%s').length`, req.Selector), &count))
	jsonResp(w, map[string]int{"count": count})
}

func hInsertHTML(w http.ResponseWriter, r *http.Request) {
	var req struct{ Selector string `json:"selector"`; Position string `json:"position"`; HTML string `json:"html"` }
	decode(r, &req)
	chromedp.Run(browser.ctx, chromedp.Evaluate(fmt.Sprintf(`document.querySelector('%s').insertAdjacentHTML('%s', '%s')`, req.Selector, req.Position, req.HTML), nil))
	jsonResp(w, map[string]string{"status": "inserted"})
}

func hRemoveElement(w http.ResponseWriter, r *http.Request) {
	var req struct{ Selector string `json:"selector"` }
	decode(r, &req)
	chromedp.Run(browser.ctx, chromedp.Evaluate(fmt.Sprintf(`document.querySelector('%s')?.remove()`, req.Selector), nil))
	jsonResp(w, map[string]string{"status": "removed"})
}

func hAddClass(w http.ResponseWriter, r *http.Request) {
	var req struct{ Selector string `json:"selector"`; Class string `json:"class"` }
	decode(r, &req)
	chromedp.Run(browser.ctx, chromedp.Evaluate(fmt.Sprintf(`document.querySelector('%s')?.classList.add('%s')`, req.Selector, req.Class), nil))
	jsonResp(w, map[string]string{"status": "added"})
}

func hRemoveClass(w http.ResponseWriter, r *http.Request) {
	var req struct{ Selector string `json:"selector"`; Class string `json:"class"` }
	decode(r, &req)
	chromedp.Run(browser.ctx, chromedp.Evaluate(fmt.Sprintf(`document.querySelector('%s')?.classList.remove('%s')`, req.Selector, req.Class), nil))
	jsonResp(w, map[string]string{"status": "removed"})
}

func hFocus(w http.ResponseWriter, r *http.Request) {
	var req struct{ Selector string `json:"selector"` }
	decode(r, &req)
	chromedp.Run(browser.ctx, chromedp.Focus(req.Selector))
	jsonResp(w, map[string]string{"status": "focused"})
}

func hBlur(w http.ResponseWriter, r *http.Request) {
	var req struct{ Selector string `json:"selector"` }
	decode(r, &req)
	chromedp.Run(browser.ctx, chromedp.Evaluate(fmt.Sprintf(`document.querySelector('%s')?.blur()`, req.Selector), nil))
	jsonResp(w, map[string]string{"status": "blurred"})
}

func hCount2(w http.ResponseWriter, r *http.Request) {
	var req struct{ Selector string `json:"selector"` }
	decode(r, &req)
	var count int
	chromedp.Run(browser.ctx, chromedp.Evaluate(fmt.Sprintf(`document.querySelectorAll('%s').length`, req.Selector), &count))
	jsonResp(w, map[string]int{"count": count})
}

func hIsVisible(w http.ResponseWriter, r *http.Request) {
	var req struct{ Selector string `json:"selector"` }
	decode(r, &req)
	var result bool
	chromedp.Run(browser.ctx, chromedp.Evaluate(fmt.Sprintf(`(() => { const el = document.querySelector('%s'); if (!el) return false; const s = getComputedStyle(el); return s.display !== 'none' && s.visibility !== 'hidden' && s.opacity !== '0'; })()`, req.Selector), &result))
	jsonResp(w, map[string]bool{"visible": result})
}

// Input
func hClick(w http.ResponseWriter, r *http.Request) {
	var req struct{ Selector string `json:"selector"` }
	decode(r, &req)
	chromedp.Run(browser.ctx, chromedp.Click(req.Selector))
	jsonResp(w, map[string]string{"status": "clicked"})
}

func hDoubleClick(w http.ResponseWriter, r *http.Request) {
	var req struct{ Selector string `json:"selector"` }
	decode(r, &req)
	chromedp.Run(browser.ctx, chromedp.DoubleClick(req.Selector))
	jsonResp(w, map[string]string{"status": "double-clicked"})
}

func hType(w http.ResponseWriter, r *http.Request) {
	var req struct{ Selector string `json:"selector"`; Text string `json:"text"` }
	decode(r, &req)
	chromedp.Run(browser.ctx, chromedp.SendKeys(req.Selector, req.Text))
	jsonResp(w, map[string]string{"status": "typed"})
}

func hClear(w http.ResponseWriter, r *http.Request) {
	var req struct{ Selector string `json:"selector"` }
	decode(r, &req)
	chromedp.Run(browser.ctx, chromedp.Clear(req.Selector))
	jsonResp(w, map[string]string{"status": "cleared"})
}

func hHover(w http.ResponseWriter, r *http.Request) {
	var req struct{ Selector string `json:"selector"` }
	decode(r, &req)
	chromedp.Run(browser.ctx, chromedp.Evaluate(fmt.Sprintf(`document.querySelector('%s')?.dispatchEvent(new MouseEvent('mouseover', {bubbles: true}))`, req.Selector), nil))
	jsonResp(w, map[string]string{"status": "hovered"})
}

func hMouseMove(w http.ResponseWriter, r *http.Request) {
	var req struct{ X int `json:"x"`; Y int `json:"y"` }
	decode(r, &req)
	chromedp.Run(browser.ctx, chromedp.Evaluate(fmt.Sprintf(`document.elementFromPoint(%d, %d)?.dispatchEvent(new MouseEvent('mousemove', {clientX: %d, clientY: %d, bubbles: true}))`, req.X, req.Y, req.X, req.Y), nil))
	jsonResp(w, map[string]string{"status": "moved"})
}

func hScroll(w http.ResponseWriter, r *http.Request) {
	var req struct{ X int `json:"x"`; Y int `json:"y"` }
	decode(r, &req)
	chromedp.Run(browser.ctx, chromedp.Evaluate(fmt.Sprintf(`window.scrollBy(%d, %d)`, req.X, req.Y), nil))
	jsonResp(w, map[string]string{"status": "scrolled"})
}

func hPressKey(w http.ResponseWriter, r *http.Request) {
	var req struct{ Key string `json:"key"` }
	decode(r, &req)
	chromedp.Run(browser.ctx, chromedp.Evaluate(fmt.Sprintf(`document.dispatchEvent(new KeyboardEvent("keydown", {key: "%s"}))`, req.Key), nil))
	jsonResp(w, map[string]string{"status": "key-pressed"})
}

func hUploadFile(w http.ResponseWriter, r *http.Request) {
	var req struct{ Selector string `json:"selector"`; Files []string `json:"files"` }
	decode(r, &req)
	chromedp.Run(browser.ctx, chromedp.SetUploadFiles(req.Selector, req.Files))
	jsonResp(w, map[string]string{"status": "uploaded"})
}

func hSelect(w http.ResponseWriter, r *http.Request) {
	var req struct{ Selector string `json:"selector"`; Values []string `json:"values"` }
	decode(r, &req)
	chromedp.Run(browser.ctx, chromedp.Evaluate(fmt.Sprintf(`document.querySelector('%s').value = '%s'`, req.Selector, req.Values[0]), nil))
	jsonResp(w, map[string]string{"status": "selected"})
}

// Network
func hGetCookies(w http.ResponseWriter, r *http.Request) {
	var cookies string
	chromedp.Run(browser.ctx, chromedp.Evaluate(`document.cookie`, &cookies))
	jsonResp(w, map[string]string{"cookies": cookies})
}

func hSetCookie(w http.ResponseWriter, r *http.Request) {
	var req struct{ Name string `json:"name"`; Value string `json:"value"` }
	decode(r, &req)
	chromedp.Run(browser.ctx, chromedp.Evaluate(fmt.Sprintf(`document.cookie = '%s=%s; path=/'`, req.Name, req.Value), nil))
	jsonResp(w, map[string]string{"status": "set"})
}

func hDeleteCookie(w http.ResponseWriter, r *http.Request) {
	var req struct{ Name string `json:"name"` }
	decode(r, &req)
	chromedp.Run(browser.ctx, chromedp.Evaluate(fmt.Sprintf(`document.cookie = '%s=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'`, req.Name), nil))
	jsonResp(w, map[string]string{"status": "deleted"})
}

// JS
func hExecuteJS(w http.ResponseWriter, r *http.Request) {
	var req struct{ JS string `json:"js"` }
	decode(r, &req)
	var result interface{}
	chromedp.Run(browser.ctx, chromedp.Evaluate(req.JS, &result))
	jsonResp(w, map[string]interface{}{"result": result})
}

// Screenshot
func hScreenshot(w http.ResponseWriter, r *http.Request) {
	var req struct{ Path string `json:"path"` }
	decode(r, &req)
	var buf []byte
	chromedp.Run(browser.ctx, chromedp.CaptureScreenshot(&buf))
	if req.Path != "" {
		os.WriteFile(req.Path, buf, 0644)
	}
	w.Header().Set("Content-Type", "image/png")
	w.Write(buf)
}

// Info
func hGetURL(w http.ResponseWriter, r *http.Request) {
	var url string
	chromedp.Run(browser.ctx, chromedp.Evaluate(`window.location.href`, &url))
	jsonResp(w, map[string]string{"url": url})
}

func hGetTitle(w http.ResponseWriter, r *http.Request) {
	var title string
	chromedp.Run(browser.ctx, chromedp.Title(&title))
	jsonResp(w, map[string]string{"title": title})
}

func hGetText2(w http.ResponseWriter, r *http.Request) {
	var text string
	chromedp.Run(browser.ctx, chromedp.Evaluate(`document.body.innerText`, &text))
	jsonResp(w, map[string]string{"text": text})
}

func hGetHTML2(w http.ResponseWriter, r *http.Request) {
	var html string
	chromedp.Run(browser.ctx, chromedp.Evaluate(`document.body.innerHTML`, &html))
	jsonResp(w, map[string]string{"html": html})
}

func hGetFullHTML(w http.ResponseWriter, r *http.Request) {
	var html string
	chromedp.Run(browser.ctx, chromedp.Evaluate(`document.documentElement.outerHTML`, &html))
	jsonResp(w, map[string]string{"html": html})
}

func hGetFingerprint(w http.ResponseWriter, r *http.Request) {
	var result string
	chromedp.Run(browser.ctx, chromedp.Evaluate(`JSON.stringify({
		webdriver: navigator.webdriver,
		platform: navigator.platform,
		languages: navigator.languages,
		plugins: navigator.plugins.length,
		hardwareConcurrency: navigator.hardwareConcurrency,
		deviceMemory: navigator.deviceMemory,
		screenWidth: screen.width,
		screenHeight: screen.height,
		colorDepth: screen.colorDepth,
		innerWidth: window.innerWidth,
		innerHeight: window.innerHeight,
		timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
	})`, &result))
	jsonResp(w, result)
}

func hGetAntiBot(w http.ResponseWriter, r *http.Request) {
	var cookies string
	chromedp.Run(browser.ctx, chromedp.Evaluate(`document.cookie`, &cookies))
	cookieMap := map[string]string{}
	for _, c := range splitCookies(cookies) {
		parts := splitN(c, "=", 2)
		if len(parts) == 2 {
			cookieMap[parts[0]] = parts[1]
		}
	}
	status := map[string]interface{}{
		"cookies": cookieMap,
	}
	for k := range cookieMap {
		switch {
		case k == "_abck":
			status["has_abck"] = true
		case len(k) > 2 && k[:3] == "px_":
			status["has_px"] = true
		case k == "datadome":
			status["has_datadome"] = true
		}
	}
	jsonResp(w, status)
}

func hGetLocalStorage(w http.ResponseWriter, r *http.Request) {
	var data string
	chromedp.Run(browser.ctx, chromedp.Evaluate(`JSON.stringify(localStorage)`, &data))
	jsonResp(w, map[string]string{"data": data})
}

func hSetLocalStorage(w http.ResponseWriter, r *http.Request) {
	var req struct{ Key string `json:"key"`; Value string `json:"value"` }
	decode(r, &req)
	chromedp.Run(browser.ctx, chromedp.Evaluate(fmt.Sprintf(`localStorage.setItem('%s', '%s')`, req.Key, req.Value), nil))
	jsonResp(w, map[string]string{"status": "set"})
}

func hClearLocalStorage(w http.ResponseWriter, r *http.Request) {
	chromedp.Run(browser.ctx, chromedp.Evaluate(`localStorage.clear()`, nil))
	jsonResp(w, map[string]string{"status": "cleared"})
}

func hWarmup(w http.ResponseWriter, r *http.Request) {
	browser.Warmup()
	jsonResp(w, map[string]string{"status": "warmup complete"})
}

func hHealth(w http.ResponseWriter, r *http.Request) {
	jsonResp(w, map[string]string{"status": "ok", "version": "1.0.0"})
}

func hConfig2(w http.ResponseWriter, r *http.Request) {
	jsonResp(w, config)
}

// Helpers
func splitCookies(s string) []string {
	return splitN(s, ";", -1)
}

func splitN(s, sep string, n int) []string {
	if n <= 0 {
		return []string{s}
	}
	parts := []string{}
	for len(s) > 0 && len(parts) < n {
		idx := -1
		for i := 0; i <= len(s)-len(sep); i++ {
			if s[i:i+len(sep)] == sep {
				idx = i
				break
			}
		}
		if idx < 0 {
			parts = append(parts, s)
			break
		}
		parts = append(parts, s[:idx])
		s = s[idx+len(sep):]
	}
	return parts
}
