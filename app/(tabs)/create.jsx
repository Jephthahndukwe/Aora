import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import React, { useState } from 'react';
import FormField from '../../components/FormField';
import { Video, ResizeMode } from 'expo-av';
import { icons } from '../../constants';
import CustomButton from '../../components/CustomButton';
import { router } from 'expo-router';
import { createVideo } from '../../lib/appwrite';
import { useGlobalContext } from '../../context/GlobalProvider';
import * as ImagePicker from 'expo-image-picker';

const Create = () => {
  const { user } = useGlobalContext();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [form, setForm] = useState({
    title: "",
    video: null,
    thumbnail: null,
    prompt: "",
  });

  const openPicker = async (selectType) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: selectType === 'image' ? ImagePicker.MediaTypeOptions.Images : ImagePicker.MediaTypeOptions.Videos,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      if (selectType === "image") {
        setForm({
          ...form,
          thumbnail: result.assets[0],
        });
      }

      if (selectType === "video") {
        setForm({
          ...form,
          video: result.assets[0],
        });
      }
    }
  };

  const handleProgress = (progress) => {
    setProgress(progress);
  };

  const submit = async () => {
    if (
      form.prompt === "" ||
      form.title === "" ||
      !form.thumbnail ||
      !form.video
    ) {
      return Alert.alert("Please provide all fields");
    }
  
    console.log("Submitting form:", form);
  
    setUploading(true);
    try {
      await createVideo({
        ...form,
        userId: user.$id,
      }, handleProgress);
  
      Alert.alert("Success", "Post uploaded successfully");
      router.push("/home");
    } catch (error) {
      console.error("Error in submit function:", error.message);
      Alert.alert("Error", error.message);
    } finally {
      setForm({
        title: "",
        video: null,
        thumbnail: null,
        prompt: "",
      });
  
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <SafeAreaView className='bg-primary h-full'>
      <ScrollView className='px-4 my-6'>
        <Text className='text-2xl text-white font-psemibold mt-6'>
          Upload Videos
        </Text>

        <FormField 
          title='Video Title'
          value={form.title}
          placeholder='Give your video a catchy title...'
          handleChangeText={(e) => setForm({ ...form, title: e })}
          otherStyles='mt-10'
        />

        <View className='mt-7 space-y-2'>
          <Text className='text-gray-100 text-base font-pmedium'>
            Upload Video
          </Text>

          <TouchableOpacity onPress={() => openPicker('video')}>
            {form.video ? (
              <Video
                source={{ uri: form.video.uri }}
                className='w-full h-64 rounded-2xl'
                resizeMode={ResizeMode.COVER}
              />
            ) : (
              <View className='w-full h-40 px-4 bg-black-100 rounded-2xl justify-center items-center'>
                <View className='w-14 h-14 border border-dashed border-secondary-100 justify-center items-center'>
                  <Image 
                    source={icons.upload}
                    resizeMode='contain'
                    className='w-1/1 h-1/2'
                  />
                </View>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View className='mt-7 space-y-2'>
          <Text className='text-gray-100 text-base font-pmedium'>
            Thumbnail Image
          </Text>

          <TouchableOpacity onPress={() => openPicker('image')}>
            {form.thumbnail ? (
              <Image 
                source={{ uri: form.thumbnail.uri }}
                resizeMode='cover'
                className='w-full h-64 rounded-2xl'
              />
            ) : (
              <View className='w-full h-16 px-4 bg-black-100 rounded-2xl justify-center items-center border-2 border-black-200 flex-row space-x-2'>
                <Image 
                  source={icons.upload}
                  resizeMode='contain'
                  className='w-5 h-5'
                />
                <Text className='text-gray-100 font-pmedium text-sm'>
                  Choose a file
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <FormField 
          title='AI Prompt'
          value={form.prompt}
          placeholder='The prompt you used to create this video'
          handleChangeText={(e) => setForm({ ...form, prompt: e })}
          otherStyles='mt-7'
        />

        {uploading ? (
          <View className='mt-7 justify-center items-center'>
            <Text className='text-gray-100 mt-2'>Uploading video...</Text>
            <View className='w-full h-2 bg-gray-300 mt-2 rounded'>
              <View className='bg-secondary-100 h-full rounded' style={{ width: `${progress}%` }} />
            </View>
            <Text className='text-gray-100 mt-2'>{progress}%</Text>
          </View>
        ) : (
          <CustomButton 
            title='Submit & Publish'
            handlePress={submit}
            containerStyles='mt-7'
            isLoading={uploading}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Create;
