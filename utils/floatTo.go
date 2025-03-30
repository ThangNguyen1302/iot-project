package util


func toFloat64(v interface{}) (float64, bool) {
    switch value := v.(type) {
    case float64:
        return value, true
    case int32:
        return float64(value), true
    case int64:
        return float64(value), true
    default:
        return 0, false
    }
}