package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"my_iot_project/utils"
	"net/http"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// Define FeedData struct
type FeedData struct {
    ID        string `json:"id" bson:"id"`
    Value     string `json:"value" bson:"value"`
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

        // Store data into MongoDB
        ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
        defer cancel()

        // Convert slice of structs into slice of interface{} to insert into MongoDB
        var documents []interface{}
        for _, d := range data {
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
        // Enable CORS so frontend can access this API
        w.Header().Set("Access-Control-Allow-Origin", "*")
        w.Header().Set("Content-Type", "application/json")

        // Send JSON response to frontend
        json.NewEncoder(w).Encode(data)
    }
}

func main() {
    connectToMongoDB()
    config, err := util.LoadConfig(".")
    if err != nil {
        log.Fatal("Failed to load config:", err)
    }
	fmt.Print(config)
    http.HandleFunc("/fetch", fetchData(config)) // API endpoint

    fmt.Println("Server running on port 8080...")
    log.Fatal(http.ListenAndServe(":8080", nil))
}