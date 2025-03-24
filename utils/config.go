package util

import (
	"strings"

	"github.com/spf13/viper"
)

type Config struct {
	Username string `mapstructure:"USERNAME1"`
	AioKey   string `mapstructure:"AIOKEY"`
	FeedKeyGet  [] string `mapstructure:"FEEDKEYGET"`
	FeedKeyPost [] string `mapstructure:"FEEDKEYPOST"`
}

func LoadConfig(path string) (config Config, err error) {
	viper.AddConfigPath(path)
	viper.SetConfigName("app")
	viper.SetConfigType("env")

	viper.AutomaticEnv()

	err = viper.ReadInConfig()

	if err != nil {
		return
	}
	err = viper.Unmarshal(&config)
	config.FeedKeyGet = strings.Split(viper.GetString("FEEDKEYGET"), ",")
    config.FeedKeyPost = strings.Split(viper.GetString("FEEDKEYPOST"), ",")
	return
}
