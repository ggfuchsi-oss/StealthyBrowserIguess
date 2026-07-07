package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"path/filepath"
	"syscall"
	"time"

	"github.com/gorilla/mux"
)

type Config struct {
	Server struct {
		Port int    `json:"port"`
		Host string `json:"host"`
	} `json:"server"`
	Browser struct {
		ChromePath string   `json:"chrome_path"`
		Headless   bool     `json:"headless"`
		Stealth    bool     `json:"stealth"`
		Proxy      string   `json:"proxy"`
		UserAgent  string   `json:"user_agent"`
		ViewportW  int      `json:"viewport_width"`
		ViewportH  int      `json:"viewport_height"`
		StealthJS  []string `json:"stealth_js"`
	} `json:"browser"`
	Warmup struct {
		Enabled   bool     `json:"enabled"`
		Sites     []string `json:"sites"`
		Delay     int      `json:"delay_ms"`
		Scrolls   int      `json:"scrolls"`
		MouseMoves int     `json:"mouse_moves"`
	} `json:"warmup"`
	Session struct {
		Persist bool   `json:"persist"`
		Dir     string `json:"dir"`
	} `json:"session"`
}

var config Config

func loadConfig() {
	configFile := "config.json"
	if _, err := os.Stat(configFile); os.IsNotExist(err) {
		config = Config{
			Server: struct {
				Port int    `json:"port"`
				Host string `json:"host"`
			}{Port: 8080, Host: "127.0.0.1"},
			Browser: struct {
				ChromePath string   `json:"chrome_path"`
				Headless   bool     `json:"headless"`
				Stealth    bool     `json:"stealth"`
				Proxy      string   `json:"proxy"`
				UserAgent  string   `json:"user_agent"`
				ViewportW  int      `json:"viewport_width"`
				ViewportH  int      `json:"viewport_height"`
				StealthJS  []string `json:"stealth_js"`
			}{
				ChromePath: getDefaultChromePath(),
				Headless:   true,
				Stealth:    true,
				UserAgent:  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36",
				ViewportW:  1920,
				ViewportH:  1080,
			},
			Warmup: struct {
				Enabled   bool     `json:"enabled"`
				Sites     []string `json:"sites"`
				Delay     int      `json:"delay_ms"`
				Scrolls   int      `json:"scrolls"`
				MouseMoves int     `json:"mouse_moves"`
			}{
				Enabled:   true,
				Sites:     []string{"https://www.example.com", "https://www.wikipedia.org"},
				Delay:     2000,
				Scrolls:   3,
				MouseMoves: 5,
			},
			Session: struct {
				Persist bool   `json:"persist"`
				Dir     string `json:"dir"`
			}{Persist: true, Dir: "sessions"},
		}
		data, _ := json.MarshalIndent(config, "", "  ")
		os.WriteFile(configFile, data, 0644)
	} else {
		data, _ := os.ReadFile(configFile)
		json.Unmarshal(data, &config)
	}
}

func getDefaultChromePath() string {
	customPath := filepath.Join(os.Getenv("USERPROFILE"), "..", "..", "chromium", "src", "out", "Default", "chrome.exe")
	if _, err := os.Stat(customPath); err == nil {
		return customPath
	}
	return "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
}

func main() {
	log.SetFlags(log.LstdFlags | log.Lshortfile)
	loadConfig()
	log.Printf("Config loaded: port=%d, headless=%v, stealth=%v", config.Server.Port, config.Browser.Headless, config.Browser.Stealth)

	browser = NewBrowser(&config)
	if err := browser.Launch(); err != nil {
		log.Fatalf("Failed to launch browser: %v", err)
	}
	defer browser.Close()

	if config.Warmup.Enabled {
		browser.Warmup()
	}

	r := mux.NewRouter()
	setupRoutes(r)

	r.Use(func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
			if r.Method == "OPTIONS" {
				w.WriteHeader(http.StatusOK)
				return
			}
			next.ServeHTTP(w, r)
		})
	})

	addr := fmt.Sprintf("%s:%d", config.Server.Host, config.Server.Port)
	log.Printf("Stealth API server starting on %s", addr)

	server := &http.Server{
		Addr:         addr,
		Handler:      r,
		ReadTimeout:  30 * time.Second,
		WriteTimeout: 30 * time.Second,
	}

	go func() {
		sigChan := make(chan os.Signal, 1)
		signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)
		<-sigChan
		log.Println("Shutting down...")
		server.Shutdown(context.Background())
	}()

	if err := server.ListenAndServe(); err != http.ErrServerClosed {
		log.Fatalf("Server error: %v", err)
	}
}
