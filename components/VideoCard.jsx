import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { icons } from '../constants';
import { ResizeMode, Video } from 'expo-av';

const VideoCard = ({ video: { title, thumbnail, video, creator: { username, avatar } }, onMenuPress, setOption, setShowDeleteModal, option }) => {
  const [play, setPlay] = useState(false);

  return (
    <View className='flex-col items-center px-4 mb-14'>
      <View className='flex-row gap-3 items-start'>
        <View className='justify-center flex-row items-center flex-1'>
          <View className='w-[46px] h-[46px] rounded-lg border-secondary border justify-center items-center p-0.5'>
            <Image source={{ uri: avatar }}
              className='w-full h-full rounded-lg'
              resizeMode='cover'
            />
          </View>
          <View className='justify-center flex-1 ml-3 gap-y-1'>
            <Text className='text-white font-psemibold text-sm' numberOfLines={1}>
              {title}
            </Text>
            <Text className='text-xs text-gray-100 font-pregular' numberOfLines={1}>
              {username}
            </Text>
          </View>
        </View>

        <TouchableOpacity className='pt-2' onPress={onMenuPress} setOption={setOption} setShowDeleteModal={setShowDeleteModal} option={option}>
          <Image source={icons.menu} className='w-5 h-5' resizeMode='contain' />
        </TouchableOpacity>
        {option && (
            <View className='absolute top-10 right-5 bg-white px-5 rounded-lg shadow-lg z-10'>
            <TouchableOpacity
            className='py-2'
            onPress={() => {
                setOption(false);
                setShowDeleteModal(true);
            }}
            >
            <Text className='text-red-500 text-base'>Delete</Text>
            </TouchableOpacity>
        </View>
        )}
      </View>

      {play ? (
        <Video
          source={{ uri: video }}
          className='w-full h-60 rounded-xl'
          resizeMode={ResizeMode.CONTAIN}
          useNativeControls
          shouldPlay
          onPlaybackStatusUpdate={(status) => {
            if (status.didJustFinish) {
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
          activeOpacity={0.7}
          onPress={() => setPlay(true)}
          className='w-full h-60 rounded-xl mt-3 relative justify-center items-center'
        >
          <Image
            source={{ uri: thumbnail }}
            className='w-full h-full rounded-xl mt-3'
            resizeMode='cover'
          />
          <Image
            source={icons.play}
            className='w-12 h-12 absolute'
            resizeMode='contain'
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default VideoCard;
