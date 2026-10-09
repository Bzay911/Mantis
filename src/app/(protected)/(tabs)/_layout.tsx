import { NativeTabs } from "expo-router/unstable-native-tabs";
import {DynamicColorIOS, Platform} from "react-native";

export default function TabsLayout() {
  const tint =
  Platform.OS === "ios"
    ? DynamicColorIOS({ light: "#9DC228", dark: "#9DC228" })
    : "#9DC228";
    
    return (
        <NativeTabs minimizeBehavior="onScrollDown" tintColor={tint}> 
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{default: "square.grid.2x2", selected: "square.grid.2x2.fill"}} md="home" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="my-haircuts">
        <NativeTabs.Trigger.Icon sf={{default: "photo.stack", selected: "photo.stack.fill"}} md="image" />
        <NativeTabs.Trigger.Label>My Haircuts</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <NativeTabs.Trigger.Icon sf={{default: "person", selected: "person.fill"}} md="person" />
        <NativeTabs.Trigger.Label>Profile</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="camera" role="search">
        <NativeTabs.Trigger.Icon sf={{default: "camera", selected: "camera.fill"}} md="camera"/>
        <NativeTabs.Trigger.Label>Camera</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
    );
}