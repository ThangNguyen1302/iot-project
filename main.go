package main

import (
    "encoding/json"
    "fmt"
    "log"
    "net/http"
    "my_iot_project/utils"
)

// Define FeedData struct
type FeedData struct {
    ID        string `json:"id"`
    Value     string `json:"value"`
    CreatedAt string `json:"created_at"`
}


// Fetch data from Adafruit IO
func fetchData(config util.Config) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
        // Fetch data from Adafruit IO
        url := fmt.Sprintf("https://io.adafruit.com/api/v2/%s/feeds/%s/data", config.Username, config.FeedKey)

        req, _ := http.NewRequest("GET", url, nil)
        req.Header.Set("X-AIO-Key", config.AioKey)

        client := &http.Client{}
        resp, err := client.Do(req)
        if err != nil {
            http.Error(w, "Failed to fetch data", http.StatusInternalServerError)
            return
        }
        defer resp.Body.Close()

        var data []FeedData
        if err := json.NewDecoder(resp.Body).Decode(&data); err != nil {
            http.Error(w, "Error decoding JSON", http.StatusInternalServerError)
            return
        }

        // Enable CORS so frontend can access this API
        w.Header().Set("Access-Control-Allow-Origin", "*")
        w.Header().Set("Content-Type", "application/json")

        // Send JSON response to frontend
        json.NewEncoder(w).Encode(data)
    }
}

func main() {
    config, err := util.LoadConfig(".")
    if err != nil {
        log.Fatal("Failed to load config:", err)
    }
	fmt.Print(config)
    http.HandleFunc("/fetch", fetchData(config)) // API endpoint

    fmt.Println("Server running on port 8080...")
    log.Fatal(http.ListenAndServe(":8080", nil))
}