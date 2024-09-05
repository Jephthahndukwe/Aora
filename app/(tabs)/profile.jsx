import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, Modal, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import EmptyState from '../../components/EmptyState';
import VideoCard from '../../components/VideoCard';
import { getUserPosts, signOut, deleteVideo } from '../../lib/appwrite';
import useAppwrite from '../../lib/useAppwrite';
import { useGlobalContext } from '../../context/GlobalProvider';
import { icons } from '../../constants';
import InfoBox from '../../components/InfoBox';
import { router } from 'expo-router';

const Profile = () => {
  const { user, setUser, setIsLoggedIn } = useGlobalContext();
  const { data: posts, refetch } = useAppwrite(() => getUserPosts(user.$id));
  const [selectedPost, setSelectedPost] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [option, setOption] = useState(false);

  const [refreshing, setRefreshing] = useState(false)

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  } 

  const handleDelete = async () => {
    try {
      await deleteVideo(selectedPost.$id);
      setShowDeleteModal(false);
      refetch(); // Refresh the list after deletion
    } catch (error) {
      console.error('Error deleting video:', error.message);
    }
  };

  const logout = async () => {
    await signOut();
    setUser(null);
    setIsLoggedIn(false);

    router.replace('/signin');
  };

  const onMenuPress = (videoId) => {
    setSelectedVideoId(videoId);
    setOption(true)
  };

  return (
    <SafeAreaView className='bg-primary h-full'>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.$id}
        renderItem={({ item }) => (
          <VideoCard 
            video={item} 
            onMenuPress={() => {
              setSelectedPost(item);
              setOption(true);
            }}
            setShowDeleteModal={setShowDeleteModal}
            setOption={setOption} 
            option={option} 
            />
        )}
        ListHeaderComponent={() => (
          <View className='w-full justify-center items-center mt-6 mb-12 px-4'>
            <TouchableOpacity
              className='w-full items-end mb-10'
              onPress={logout}
            >
              <Image
                source={icons.logout}
                className='w-6 h-6'
                resizeMode="contain"
              />
            </TouchableOpacity>

            <View className='w-16 h-16 border border-secondary rounded-lg justify-center items-center'>
              <Image
                source={{ uri: user?.avatar }}
                className='w-[90%] h-[90%] rounded-lg'
                resizeMode='cover'
              />
            </View>

            <InfoBox
              title={user?.username}
              containerStyles='mt-5'
              titleStyles='text-lg'
            />

            <View className='mt-5 flex-row'>
              <InfoBox
                title={posts.length || 0}
                subtitle="Posts"
                containerStyles='mr-10'
                titleStyles='text-xl'
              />
              <InfoBox
                title='1.2K'
                subtitle='Followers'
                titleStyles='text-xl'
              />
            </View>
          </View>
        )}
        ListEmptyComponent={() => (
          <EmptyState
            title='No Videos Found'
            subtitle="No videos found for this search query"
          />
        )}

        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
      
        {showDeleteModal && (
        <Modal
          transparent={true}
          animationType="slide"
          visible={showDeleteModal}
          onRequestClose={() => setShowDeleteModal(false)}
        >
          <View className='flex-1 justify-center items-center bg-black bg-opacity-50'>
            <View className='bg-white p-6 rounded-lg'>
              <Text className='text-black text-lg mb-4'>Are you sure you want to delete this video?</Text>
              <View className='flex-row justify-between'>
                <TouchableOpacity onPress={() => setShowDeleteModal(false)} className='px-4 py-2 bg-gray-300 rounded-lg'>
                  <Text className='text-black'>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleDelete} className='px-4 py-2 bg-red-500 rounded-lg'>
                  <Text className='text-white'>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
      
    </SafeAreaView>
  );
};

export default Profile;
