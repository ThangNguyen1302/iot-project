package util

import (
	"bufio"
	"context"
	"encoding/json"
	"fmt"
	"os"
	"strconv"
	"strings"

	// "io"
	"log"
	"net/http"
	"sync"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)
var mongoClient *mongo.Client

type FeedData struct {
	ID           string `json:"id" bson:"id"`
	Value        string `json:"value" bson:"value"`
	CreatedAt    string `json:"created_at" bson:"created_at"`
	TimeDownload string `bson:"time_download"`
}
func processAndStoreFanTrainData() {
	// Mở file fanTrain.txt
	file, err := os.Open("fan_speed_data_large.txt")
	if err != nil {
		log.Fatal("Error opening file:", err)
	}
	defer file.Close()

	// Tạo scanner để đọc từng dòng trong file
	scanner := bufio.NewScanner(file)

	// Kết nối đến MongoDB
	db := mongoClient.Database("iot_data")
	trainDataFanCollection := db.Collection("train-data-fan")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	

	_, err = trainDataFanCollection.DeleteMany(ctx, map[string]interface{}{})
	if err != nil {
        log.Fatal("Error deleting data from train-data-fan collection:", err)
    }
    fmt.Println("All data in train-data-fan collection has been deleted.")


	// Đọc từng dòng và lưu vào collection train-data-fan
	for scanner.Scan() {
		line := scanner.Text()
		// Tách giá trị từ dòng (giả sử các giá trị được phân cách bằng dấu phẩy)
		values := strings.Split(line, ",")
		if len(values) != 3 {
			log.Println("Invalid line format:", line)
			continue
		}

		// Chuyển đổi giá trị từ chuỗi sang kiểu dữ liệu phù hợp
		tmp, err1 := strconv.ParseFloat(strings.TrimSpace(values[0]), 64)
		hum, err2 := strconv.ParseFloat(strings.TrimSpace(values[1]), 64)
		fan, err3 := strconv.Atoi(strings.TrimSpace(values[2]))
		if err1 != nil || err2 != nil || err3 != nil {
			log.Println("Error parsing line:", line)
			continue
		}
		document := map[string]interface{}{
			"tmp":  tmp,
			"hum":  hum,
			"fan":  fan,
			"time": time.Now(),
		}

		// Tạo context cho MongoDB
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()

		// Lưu document vào collection train-data-fan
		_, err := trainDataFanCollection.InsertOne(ctx, document)
		if err != nil {
			log.Println("Error inserting into train-data-fan collection:", err)
		}
	}

	// Kiểm tra lỗi khi đọc file
	if err := scanner.Err(); err != nil {
		log.Fatal("Error reading file:", err)
	}

	fmt.Println("Data successfully processed and stored in train-data-fan collection!")
}
func ConnectToMongoDB() {
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
	processAndStoreFanTrainData()
	// Tạo các collection tương ứng với danh sách feed keys
	fmt.Println("Connected to MongoDB!")
}

// Hàm fetch dữ liệu từ Adafruit IO và lưu vào MongoDB
func FetchAndStoreData(config Config) {
	var wg sync.WaitGroup
	db := mongoClient.Database("iot_data")
	for _, feedKey := range config.FeedKeyGet {
		wg.Add(1)
		go func(feedKey string) {
			defer wg.Done()
			url := fmt.Sprintf("https://io.adafruit.com/api/v2/%s/feeds/%s/data", config.Username, feedKey)

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
			// body, err := io.ReadAll(resp.Body)
			// if err != nil {
			//     log.Println("Error reading response body:", err)
			//     return
			// }
			// fmt.Printf("Response from feed '%s': %s\n", feedKey, string(body))
			var data []FeedData
			if err := json.NewDecoder(resp.Body).Decode(&data); err != nil {
				log.Println("Error decoding JSON:", err)
				return
			}
			// Lưu dữ liệu vào MongoDB
			collection := db.Collection(feedKey) // Chọn collection dựa trên feedKey
			ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
			defer cancel()

			_, err = collection.DeleteMany(ctx, map[string]interface{}{})
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
				_, err := collection.InsertMany(ctx, documents)
				if err != nil {
					log.Println("Error inserting data into MongoDB:", err)
				} else {
					fmt.Println("Data successfully stored in MongoDB!")
				}
			}
		}(feedKey)
	}
	wg.Wait()
}