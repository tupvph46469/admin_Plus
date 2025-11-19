import './src/locales/i18n'; // phải import đầu tiên
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";

import OverviewScreen from "./screens/OverviewScreen";
import ReportScreen from "./screens/ReportScreen";
import InvoiceScreen from "./screens/InvoiceScreen";
import InvoiceDetailScreen from "./screens/InvoiceDetailScreen";
import MoreScreen from "./screens/MoreScreen";
import ListPlayPriceScreen from "./screens/ListPlayPriceScreen";
import AddPlayScreen from "./screens/AddPlayScreen";
import ItemListScreen from "./screensmini/ItemListScreen";
import ItemDetailScreen from "./screensmini/ItemDetailScreen";
import AddItemScreen from "./screensmini/AddItemScreen";
import RoleListScreen from "./screensmini/RoleListScreen";
import RoleDetailScreen from "./screensmini/RoleDetailScreen";
import RoleCreateScreen from "./screensmini/RoleCreateScreen";
import EmployeeListScreen from "./screensmini/EmployeeListScreen";
import EmployeeDetailScreen from "./screensmini/EmployeeDetailScreen";
import EmployeeFormScreen from "./screensmini/EmployeeFormScreen";
import RestaurantInfoScreen from "./screensmini/RestaurantInfoScreen";
import LanguageSettingScreen from "./screensmini/LanguageSettingScreen";
import AccountScreen from './screensmini/AccountScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === "Tổng quan") iconName = "home";
          else if (route.name === "Báo cáo") iconName = "bar-chart";
          else if (route.name === "Hoá đơn") iconName = "receipt";
          else if (route.name === "Thêm") iconName = "menu";
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#007AFF",
        tabBarInactiveTintColor: "gray",
      })}
    >
      <Tab.Screen name="Tổng quan" component={OverviewScreen} />
      <Tab.Screen name="Báo cáo" component={ReportScreen} />
      <Tab.Screen name="Hoá đơn" component={InvoiceScreen} />
      <Tab.Screen name="Thêm" component={MoreScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        {/* Tab chính */}
        <Stack.Screen
          name="HomeTabs"
          component={TabNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="Chi tiết hoá đơn" component={InvoiceDetailScreen} />
        {/* Các màn hình phụ */}
        <Stack.Screen name="Mặt hàng" component={ItemListScreen} />
        <Stack.Screen name="Chi tiết mặt hàng" component={ItemDetailScreen} />
        <Stack.Screen name="Thêm mặt hàng" component={AddItemScreen} />
        <Stack.Screen name="Vai trò" component={RoleListScreen} />
        <Stack.Screen name="Chi tiết vai trò" component={RoleDetailScreen} />
        <Stack.Screen name="Tạo vai trò" component={RoleCreateScreen} />
        <Stack.Screen name="Nhân viên" component={EmployeeListScreen} />
        <Stack.Screen name="Chi tiết nhân viên" component={EmployeeDetailScreen}/>
        <Stack.Screen name="Form nhân viên" component={EmployeeFormScreen} />
<Stack.Screen name="Danh sách vai trò" component={RoleListScreen} />
<Stack.Screen name="EmployeeForm" component={EmployeeFormScreen} />
{/* <Stack.Screen name="Tạo vai trò" component={RoleDetailScreen} /> */}
        <Stack.Screen name="Thông tin nhà hàng" component={RestaurantInfoScreen} />
        <Stack.Screen name="List giờ chơi" component={ListPlayPriceScreen} />
        <Stack.Screen name="Add giờ chơi" component={AddPlayScreen} />
        <Stack.Screen name="Thiết lập ngôn ngữ" component={LanguageSettingScreen} />
        <Stack.Screen name="Tài khoản" component={AccountScreen} />


      </Stack.Navigator>
    </NavigationContainer>
  );
}
