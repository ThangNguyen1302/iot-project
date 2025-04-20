package util

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"

	// "io"
	"log"
	"net/http"
	"time"
)

func PushDataWeb(config Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		// Handle preflight request
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		var requestData map[string]string
		if err := json.NewDecoder(r.Body).Decode(&requestData); err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}

		jsonData, err := json.Marshal(requestData)
		if err != nil {
			http.Error(w, "Error encoding JSON", http.StatusInternalServerError)
			return
		}
		feedKey := requestData["feed"]
		url := fmt.Sprintf("https://io.adafruit.com/api/v2/%s/feeds/%s/data", config.Username, feedKey)

		req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
		if err != nil {
			log.Println("Error creating request for feed", feedKey, ":", err)
			return
		}

		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("X-AIO-Key", config.AioKey)

		client := &http.Client{}
		resp, err := client.Do(req)
		if err != nil {
			log.Println("Error sending request for feed", feedKey, ":", err)
			return
		}
		defer resp.Body.Close()

		fmt.Printf("Data pushed successfully to feed %s with status %s\n", feedKey, resp.Status)
		// Lưu dữ liệu vào MongoDB
		db := mongoClient.Database("iot_data")
		collection := db.Collection(feedKey) // Chọn collection dựa trên feedKey
		ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
		defer cancel()

		// Chuẩn bị dữ liệu để lưu
		currentTime := time.Now().Format("06-01-02 15:04:05")
		pushData := PushData{
			ID:        fmt.Sprintf("%d", time.Now().UnixNano()),
			Value:     requestData["value"],
			CreatedAt: currentTime,
			Feed:      feedKey,
		}

		_, err = collection.InsertOne(ctx, pushData)
		if err != nil {
			log.Printf("Error inserting data into collection '%s': %v\n", feedKey, err)
		} else {
			fmt.Printf("Data successfully stored in MongoDB for collection '%s'!\n", feedKey)
		}

		// Phản hồi lại client
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]string{
			"message": "Data pushed successfully to specific feed",
		})
	}
}
