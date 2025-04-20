package util

import (
	"context"
	"encoding/json"

	// "io"
	"log"
	"net/http"
	"time"

	"go.mongodb.org/mongo-driver/mongo/options"
)

func FetchDataHandler(w http.ResponseWriter, r *http.Request) {
	// Kích hoạt CORS để frontend có thể truy cập API
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Content-Type", "application/json")
	// Truy vấn dữ liệu từ MongoDB
	db := mongoClient.Database("iot_data")

	collections := []string{"bbc-hum", "pir-sensor", "iot-project", "fan-level"}

	result := make(map[string]FeedData)
	for _, collectionName := range collections {
		collection := db.Collection(collectionName)

		ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
		defer cancel()

		opts := options.FindOne().SetSort(map[string]interface{}{"_id": 1})

		var data FeedData
		err := collection.FindOne(ctx, map[string]interface{}{}, opts).Decode(&data)
		if err != nil {
			log.Printf("Failed to retrieve data from collection '%s': %v\n", collectionName, err)
			continue
		}
		result[collectionName] = data
	}

	// Gửi dữ liệu JSON về frontend
	json.NewEncoder(w).Encode(result)
}

// Push data to Adafruit IO
