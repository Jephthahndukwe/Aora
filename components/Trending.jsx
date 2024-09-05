import { View, Text, FlatList, TouchableOpacity, ImageBackground, Image } from 'react-native';
import React, { useState, useEffect } from 'react';
import * as Animatable from 'react-native-animatable';
import { icons } from '../constants';
import { Video, ResizeMode } from 'expo-av';

const zoomIn = {
    0: {
        scale: 0.9
    },
    1: {
        scale: 1.1
    }
}

const zoomOut = {
    0: {
        scale: 1
    },
    1: {
        scale: 0.9
    }
}

const sampleData = [
    {
        $id: '1',
        video: 'https://www.w3schools.com/html/mov_bbb.mp4',
        thumbnail: 'https://via.placeholder.com/150'
    },
    {
        $id: '2',
        video: 'https://www.w3schools.com/html/mov_bbb.mp4',
        thumbnail: 'https://via.placeholder.com/150'
    }
];

const TrendingItem = ({ activeItem, item }) => {
    const [play, setPlay] = useState(false);

    if (!item) {
        return null; // Return null if the item is undefined or null
    }

    return (
        <Animatable.View 
            className='mr-5' 
            animation={activeItem === item.$id ? zoomIn : zoomOut}
            duration={500}
        >
         {play ? (
            <Video
                source={{ uri: item.video }}
                className='w-52 h-72 rounded-[35px] bg-white/10 mt-3' 
                resizeMode={ResizeMode.CONTAIN}
                useNativeControls
                shouldPlay
                onPlaybackStatusUpdate={(status) => {
                    console.log("Playback Status: ", status);
                    if(status.didJustFinish)  {
                        setPlay(false);
                    }
                }}
                onError={(error) => {
                    console.error("Video Error: ", error);
                    setPlay(false); // Fallback in case of error
                }}
            />
         ) : (
            <TouchableOpacity 
                className='relative justify-center items-center flex' 
                activeOpacity={0.7} 
                onPress={() => setPlay(true)}
            >
                <ImageBackground
                    source={{ uri: item.thumbnail }}
                    className='w-52 h-72 rounded-[35px] my-5 overflow-hidden shadow-lg shadow-black/40'
                    resizeMode='cover'
                />
                <Image
                    source={icons.play}
                    className='w-12 h-12 absolute'
                    resizeMode='contain'
                />
            </TouchableOpacity>
        )}
        </Animatable.View>
    )
}

const Trending = ({ posts = sampleData }) => { // Use sampleData as default value
    const [activeItem, setActiveItem] = useState(posts[0]?.$id); // Use optional chaining

    useEffect(() => {
        if (posts.length > 0) {
            setActiveItem(posts[0].$id);
        }
    }, [posts]);

    const viewableItemsChanged = ({ viewableItems }) => {
        if (viewableItems.length > 0) {
            setActiveItem(viewableItems[0].key);
        }
    };

    if (!posts || posts.length === 0) {
        return <Text>No posts available</Text>; // Show a message if posts are not available
    }

    return (
        <FlatList 
            data={posts} 
            keyExtractor={(item) => item.$id}
            renderItem={({ item }) => (
                <TrendingItem activeItem={activeItem} item={item} />
            )}
            onViewableItemsChanged={viewableItemsChanged}
            viewabilityConfig={{
                itemVisiblePercentThreshold: 70
            }}
            contentOffset={{ x: 170 }}
            horizontal
        />
    )
}

export default Trending;