package util

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"strconv"

	// "io"
	"log"
	"net/http"
	"time"

	"github.com/sajari/regression"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func Traindata(re *regression.Regression) {
	// Kết nối đến MongoDB và collection train-data-fan
	db := mongoClient.Database("iot_data")
	trainDataFanCollection := db.Collection("train-data-fan")

	// Tạo context để truy vấn MongoDB
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	// Lấy tất cả dữ liệu từ collection train-data-fan
	cursor, err := trainDataFanCollection.Find(ctx, map[string]interface{}{})
	if err != nil {
		log.Fatal("Error fetching data from train-data-fan collection:", err)
	}
	defer cursor.Close(ctx)

	// Tạo đối tượng hồi quy
	re.SetObserved("Fan value based on temp and hum")
	re.SetVar(0, "Temperature")
	re.SetVar(1, "Humidity")

	// Duyệt qua dữ liệu và thêm vào mô hình train
	for cursor.Next(ctx) {
		var document map[string]interface{}
		if err := cursor.Decode(&document); err != nil {
			log.Println("Error decoding document:", err)
			continue
		}

		// Lấy giá trị tmp, hum, và fan từ document
		tmp, ok1 := toFloat64(document["tmp"])
		hum, ok2 := toFloat64(document["hum"])
		fan, ok3 := toFloat64(document["fan"])
		if !ok1 || !ok2 || !ok3 {
			log.Println("Invalid data format in document:", document)
			continue
		}

		// Thêm dữ liệu vào mô hình hồi quy
		re.Train(regression.DataPoint(fan, []float64{tmp, hum}))
	}

	// Kiểm tra lỗi khi duyệt con trỏ
	if err := cursor.Err(); err != nil {
		log.Fatal("Error iterating through cursor:", err)
	}

	// Train mô hình
	re.Run()

	// In kết quả hồi quy
	// fmt.Printf("\nRegression Formula:\n%v\n", re.Formula)
	println("Train successful")
}

func AutoData(config Config, re *regression.Regression) http.HandlerFunc {
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
		// if feedKey
		// collection := db.Collection("train-data-fan")
		// ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
		// defer cancel()

		// // Chuẩn bị dữ liệu để lưu
		// pushData := Auto{
		// 	Feed:      feedKey,
		// }
		// 8888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888
		collections := []string{"bbc-hum", "iot-project"}

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
		iotProjectValue, err1 := strconv.ParseFloat(result["iot-project"].Value, 64)
		if err1 != nil {
			log.Printf("Error converting 'iot-project' value to float64: %v\n", err1)
			return
		}

		bbcHumValue, err2 := strconv.ParseFloat(result["bbc-hum"].Value, 64)
		if err2 != nil {
			log.Printf("Error converting 'bbc-hum' value to float64: %v\n", err2)
			return
		}
		prediction, err := re.Predict([]float64{iotProjectValue, bbcHumValue})
		if err != nil {
			log.Printf("Error making prediction: %v\n", err)
			return
		}

		fmt.Printf("Prediction result: %f\n", prediction)

		// Phản hồi lại client
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"message":     "Data pushed successfully to specific feed",
			"prediction":  prediction,
			"temperature": iotProjectValue,
			"hum":         bbcHumValue,
		})
	}
}
