package util

import "github.com/spf13/viper"

type Config struct {
	Username string `mapstructure:"USERNAME1"`
	AioKey   string `mapstructure:"AIOKEY"`
	FeedKey  string `mapstructure:"FEEDKEY"`
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
	return
}
