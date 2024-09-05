import { View, Text } from 'react-native'
import React from 'react'
import { TouchableOpacity } from 'react-native'

const CustomButton = ({ title, handlePress, containerStyles, textStyles, isLoading }) => {
  return (
   <TouchableOpacity onPress={handlePress} activeOpacity={0.7} className={`bg-secondary rounded-xl min-h-[52px] w-full justify-center items-center ${containerStyles} ${isLoading ? 'opacity-50' : ''}`} disabled={isLoading} >
        <Text className={`text-primary font-psemibold text-lg ${textStyles}`}>{title}</Text>
   </TouchableOpacity>
  )
}

export default CustomButton