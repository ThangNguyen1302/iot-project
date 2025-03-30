package main

import (
	"fmt"

	// "io"
	"log"
	util "my_iot_project/utils"
	"net/http"
	"time"

	"github.com/sajari/regression"
)



func main() {
	re := new(regression.Regression)
	util.ConnectToMongoDB()
	util.Traindata(re)

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
				util.FetchAndStoreData(config)
			}
		}
	}()

	// API endpoint để lấy dữ liệu từ MongoDB
	http.HandleFunc("/fetch", util.FetchDataHandler)
	http.HandleFunc("/push", util.PushDataWeb(config))
	http.HandleFunc("/auto", util.AutoData(config, re))

	fmt.Println("Server running on port 8080...")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
