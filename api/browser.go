package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"sync"
	"time"

	"github.com/chromedp/chromedp"
)

type Browser struct {
	ctx    context.Context
	cancel context.CancelFunc
	mu     sync.Mutex
	config *Config
}

func NewBrowser(cfg *Config) *Browser {
	return &Browser{config: cfg}
}

func (b *Browser) Launch() error {
	b.mu.Lock()
	defer b.mu.Unlock()

	opts := []chromedp.ExecAllocatorOption{
		chromedp.NoFirstRun,
		chromedp.NoDefaultBrowserCheck,
		chromedp.Flag("disable-blink-features", "AutomationControlled"),
		chromedp.Flag("disable-dev-shm-usage", true),
		chromedp.Flag("no-sandbox", true),
		chromedp.Flag("window-size", fmt.Sprintf("%d,%d", b.config.Browser.ViewportW, b.config.Browser.ViewportH)),
		chromedp.UserAgent(b.config.Browser.UserAgent),
	}
	if b.config.Browser.Headless {
		opts = append(opts, chromedp.Headless)
	}
	if b.config.Browser.Proxy != "" {
		opts = append(opts, chromedp.ProxyServer(b.config.Browser.Proxy))
	}
	if b.config.Browser.ChromePath != "" {
		opts = append(opts, chromedp.ExecPath(b.config.Browser.ChromePath))
	}

	allocCtx, cancel := chromedp.NewExecAllocator(context.Background(), opts...)
	b.ctx, b.cancel = chromedp.NewContext(allocCtx)
	b.cancel = cancel

	var title string
	if err := chromedp.Run(b.ctx, chromedp.Title(&title)); err != nil {
		return fmt.Errorf("failed to launch browser: %w", err)
	}
	log.Printf("Browser launched")
	return nil
}

func (b *Browser) Close() {
	b.mu.Lock()
	defer b.mu.Unlock()
	if b.cancel != nil {
		b.cancel()
	}
}

func (b *Browser) Warmup() error {
	if !b.config.Warmup.Enabled {
		return nil
	}
	log.Println("Starting warmup...")
	for _, site := range b.config.Warmup.Sites {
		log.Printf("  Visiting %s", site)
		ctx, cancel := context.WithTimeout(b.ctx, 15*time.Second)
		chromedp.Run(ctx, chromedp.Navigate(site))
		cancel()
		time.Sleep(time.Duration(b.config.Warmup.Delay) * time.Millisecond)
	}
	log.Println("Warmup complete")
	return nil
}

func (b *Browser) Goto(url string) (*PageResult, error) {
	b.mu.Lock()
	defer b.mu.Unlock()

	// Navigate with timeout - DON'T hold lock during navigation
	navCtx, navCancel := context.WithTimeout(b.ctx, 30*time.Second)
	err := chromedp.Run(navCtx, chromedp.Navigate(url))
	navCancel()
	if err != nil {
		return nil, fmt.Errorf("navigation failed: %w", err)
	}

	// Get page info
	infoCtx, infoCancel := context.WithTimeout(b.ctx, 10*time.Second)
	defer infoCancel()

	var title, content, cookies string
	chromedp.Run(infoCtx,
		chromedp.WaitReady("body"),
		chromedp.Title(&title),
		chromedp.Evaluate(`document.cookie`, &cookies),
		chromedp.Evaluate(`document.body.innerText`, &content),
	)

	return &PageResult{URL: url, Title: title, Content: content, Cookies: cookies}, nil
}

func (b *Browser) GotoWithWarmup(targetURL string) (*PageResult, error) {
	b.mu.Lock()
	ctx, cancel := context.WithTimeout(b.ctx, 10*time.Second)
	chromedp.Run(ctx, chromedp.Navigate("https://www.example.com"))
	cancel()
	b.mu.Unlock()
	return b.Goto(targetURL)
}

func (b *Browser) Eval(js string) interface{} {
	b.mu.Lock()
	defer b.mu.Unlock()
	var result interface{}
	ctx, cancel := context.WithTimeout(b.ctx, 10*time.Second)
	defer cancel()
	chromedp.Run(ctx, chromedp.Evaluate(js, &result))
	return result
}

func (b *Browser) EvalString(js string) string {
	b.mu.Lock()
	defer b.mu.Unlock()
	var result string
	ctx, cancel := context.WithTimeout(b.ctx, 10*time.Second)
	defer cancel()
	chromedp.Run(ctx, chromedp.Evaluate(js, &result))
	return result
}

func (b *Browser) Screenshot(path string) error {
	b.mu.Lock()
	defer b.mu.Unlock()
	var buf []byte
	ctx, cancel := context.WithTimeout(b.ctx, 10*time.Second)
	defer cancel()
	chromedp.Run(ctx, chromedp.CaptureScreenshot(&buf))
	return os.WriteFile(path, buf, 0644)
}

type PageResult struct {
	URL     string `json:"url"`
	Title   string `json:"title"`
	Content string `json:"content"`
	Cookies string `json:"cookies"`
}
