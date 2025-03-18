package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"log"
	util "my_iot_project/utils"
	"net/http"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// Define FeedData struct
type FeedData struct {
	ID           string `json:"id" bson:"id"`
	Value        string `json:"value" bson:"value"`
	CreatedAt    string `json:"created_at" bson:"created_at"`
	TimeDownload string `bson:"time_download"`
}
type PushData struct {
    ID       string `json:"id" bson:"id"`
    Value    string `json:"value" bson:"value"`
    CreatedAt string `json:"created_at" bson:"created_at"`
}

var mongoClient *mongo.Client
var mongoCollection *mongo.Collection

func connectToMongoDB() {
	var err error
	mongoClient, err = mongo.NewClient(options.Client().ApplyURI("mongodb://localhost:27017"))
	if err != nil {
		log.Fatal("Error creating MongoDB client:", err)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	err = mongoClient.Connect(ctx)
	if err != nil {
		log.Fatal("Error connecting to MongoDB:", err)
	}

	mongoCollection = mongoClient.Database("iot_data").Collection("feed_data")
	fmt.Println("Connected to MongoDB!")
}

// Hàm fetch dữ liệu từ Adafruit IO và lưu vào MongoDB
func fetchAndStoreData(config util.Config) {
	url := fmt.Sprintf("https://io.adafruit.com/api/v2/%s/feeds/%s/data", config.Username, config.FeedKey)

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		log.Println("Error creating request:", err)
		return
	}
	req.Header.Set("X-AIO-Key", config.AioKey)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		log.Println("Failed to fetch data:", err)
		return
	}
	defer resp.Body.Close()

	var data []FeedData
	if err := json.NewDecoder(resp.Body).Decode(&data); err != nil {
		log.Println("Error decoding JSON:", err)
		return
	}

	// Lưu dữ liệu vào MongoDB
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

    _, err = mongoCollection.DeleteMany(ctx, map[string]interface{}{})
    if err != nil {
        log.Println("Error deleting data from MongoDB:", err)
        return
    }
    fmt.Println("Data successfully deleted from MongoDB!")

	var documents []interface{}
	currentTime := time.Now().Format("06-01-02 15:04:05")
	for _, d := range data {
		d.TimeDownload = currentTime
		documents = append(documents, d)
	}
	if len(documents) > 0 {
		_, err := mongoCollection.InsertMany(ctx, documents)
		if err != nil {
			log.Println("Error inserting data into MongoDB:", err)
		} else {
			fmt.Println("Data successfully stored in MongoDB!")
		}
	}
}

// API cho phép frontend gọi dữ liệu từ MongoDB
func fetchDataHandler(w http.ResponseWriter, r *http.Request) {
	// Truy vấn dữ liệu từ MongoDB
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	cursor, err := mongoCollection.Find(ctx, map[string]interface{}{})
	if err != nil {
		http.Error(w, "Failed to retrieve data", http.StatusInternalServerError)
		return
	}
	defer cursor.Close(ctx)

	var results []FeedData
	if err := cursor.All(ctx, &results); err != nil {
		http.Error(w, "Error decoding MongoDB data", http.StatusInternalServerError)
		return
	}

	// Kích hoạt CORS để frontend có thể truy cập API
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Content-Type", "application/json")

	// Gửi dữ liệu JSON về frontend
	json.NewEncoder(w).Encode(results)
}

// Push data to Adafruit IO
func pushData(config util.Config) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
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

        url := fmt.Sprintf("https://io.adafruit.com/api/v2/%s/feeds/%s/data", config.Username, config.FeedKey)

        req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
        if err != nil {
            http.Error(w, "Error creating request", http.StatusInternalServerError)
            return
        }

        req.Header.Set("Content-Type", "application/json")
        req.Header.Set("X-AIO-Key", config.AioKey)

        client := &http.Client{}
        resp, err := client.Do(req)
        if err != nil {
            http.Error(w, "Error sending request", http.StatusInternalServerError)
            return
        }
        defer resp.Body.Close()

        // Store pushed data into MongoDB
        ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
        defer cancel()

        pushDocument := PushData{
            ID:        "manual_push", // ID giả định
            Value:     requestData["value"],
            CreatedAt: time.Now().UTC().Format(time.RFC3339),
        }

        _, err = mongoCollection.InsertOne(ctx, pushDocument)
        if err != nil {
            log.Println("Error storing pushed data into MongoDB:", err)
        } else {
            fmt.Println("Pushed data stored in MongoDB!")
        }

        w.Header().Set("Content-Type", "application/json")
        json.NewEncoder(w).Encode(map[string]string{
            "message": "Data pushed successfully",
            "status":  resp.Status,
        })
    }
}

func main() {
	connectToMongoDB()

	config, err := util.LoadConfig(".")
	if err != nil {
		log.Fatal("Failed to load config:", err)
	}

	// Tạo goroutine chạy mỗi 5 giây để lấy dữ liệu
	go func() {
		ticker := time.NewTicker(5 * time.Second)
		defer ticker.Stop()

		for {
			select {
			case <-ticker.C:
				fmt.Println("Fetching data from Adafruit IO...")
				fetchAndStoreData(config)
			}
		}
	}()

	// API endpoint để lấy dữ liệu từ MongoDB
	http.HandleFunc("/fetch", fetchDataHandler)
	http.HandleFunc("/push", pushData(config))

	fmt.Println("Server running on port 8080...")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
