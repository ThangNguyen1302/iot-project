import { Image, StyleSheet, Platform, Text, View } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { getData } from '@/services/api';
import { useEffect, useState } from 'react';

export default function HomeScreen() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getData()
      .then(fetchedData => {
      setData(fetchedData);
      console.log('Data fetched successfully', fetchedData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <View>
      {data && data.map((item, index) => (
        <Text key={index} style={styles.stepContainer}>Value: {item.value}</Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
    color: 'black',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'semibold',
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
