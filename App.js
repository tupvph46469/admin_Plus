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
import ListAreasScreen from "./screens/ListAreasScreen";
import DetailArea from "./screens/DetailArea";
import AddArea from "./screens/AddArea";
import ItemListScreen from "./screensmini/ItemListScreen";
import ItemDetailScreen from "./screensmini/ItemDetailScreen";
import AddItemScreen from "./screensmini/AddItemScreen";
import EmployeeListScreen from "./screensmini/EmployeeListScreen";
import EmployeeDetailScreen from "./screensmini/EmployeeDetailScreen";
import EmployeeFormScreen from "./screensmini/EmployeeFormScreen";
import RestaurantInfoScreen from "./screensmini/RestaurantInfoScreen";
import LanguageSettingScreen from "./screensmini/LanguageSettingScreen";
import AccountScreen from './screensmini/AccountScreen';
import LoginScreen from './screens/LoginScreen';
import TopProductsScreen from './screensmini/TopProductsScreen';
import ReportByTableScreen from './screens/ReportByTableScreen';

import TableManagementScreen from './screens/TableManageScreen';
import TableDetailScreen from './screens/TableDetailScreen';
import { navigationRef } from './services/navigationService';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();


/* ---------------------------------------------------------- */
/* ---------------------- TAB NAVIGATOR ---------------------- */
/* ---------------------------------------------------------- */
function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,              // ⭐ Bật header của từng tab
        headerTitleAlign: "center",     // ⭐ Căn giữa tiêu đề
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



/* ---------------------------------------------------------- */
/* ------------------------ MAIN APP ------------------------- */
/* ---------------------------------------------------------- */
export default function App() {
  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator>

        {/* Màn Login */}
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />

        {/* Tab chính */}
        <Stack.Screen
          name="MainTab"
          component={TabNavigator}
          options={{ headerShown: false }}   // ❗ Quan trọng: tắt header stack
        />

        {/* HOÁ ĐƠN CHI TIẾT */}
        <Stack.Screen
          name="InvoiceDetail"
          component={InvoiceDetailScreen}
          options={{ title: "Chi tiết hoá đơn", headerTitleAlign: "center" }}
        />

        {/* Các màn phụ */}
        <Stack.Screen
          name="TopProducts"
          component={TopProductsScreen}
          options={{ title: "Mặt hàng bán chạy", headerTitleAlign: "center" }}
        />

        <Stack.Screen name="Mặt hàng" component={ItemListScreen} options={{ headerTitleAlign: "center" }} />
        <Stack.Screen name="Chi tiết mặt hàng" component={ItemDetailScreen} options={{ headerTitleAlign: "center" }} />
        <Stack.Screen name="Thêm mặt hàng" component={AddItemScreen} options={{ headerTitleAlign: "center" }} />

        <Stack.Screen name="Nhân viên" component={EmployeeListScreen} options={{ headerTitleAlign: "center" }} />
        <Stack.Screen name="Chi tiết nhân viên" component={EmployeeDetailScreen} options={{ headerTitleAlign: "center" }} />
        <Stack.Screen name="Form nhân viên" component={EmployeeFormScreen} options={{ headerTitleAlign: "center" }} />

        <Stack.Screen name="Khu vực" component={ListAreasScreen} options={{ headerTitleAlign: "center" }} />
        <Stack.Screen name="Chi tiết khu vực" component={DetailArea} options={{ headerTitleAlign: "center" }} />
        <Stack.Screen name="Thêm khu vực" component={AddArea} options={{ headerTitleAlign: "center" }} />

        <Stack.Screen name="Thông tin nhà hàng" component={RestaurantInfoScreen} options={{ headerTitleAlign: "center", title:"Thông tin câu lạc bộ" }}  />
        <Stack.Screen name="List giờ chơi" component={ListPlayPriceScreen} options={{ headerTitleAlign: "center" }} />
        <Stack.Screen name="Add giờ chơi" component={AddPlayScreen} options={{ headerTitleAlign: "center" }} />

        <Stack.Screen name="Thiết lập ngôn ngữ" component={LanguageSettingScreen} options={{ headerTitleAlign: "center" }} />
        <Stack.Screen name="Tài khoản" component={AccountScreen} options={{ headerTitleAlign: "center" }} />

        <Stack.Screen
          name="ReportByTable"
          component={ReportByTableScreen}
          options={{ title: "Doanh thu theo bàn", headerTitleAlign: "center" }}
        />
               <Stack.Screen name="Bàn chơi" component={TableManagementScreen}  options={{
    title: "Bàn chơi",
    headerTitleAlign: "center", // đưa tiêu đề ra giữa
  }} />
       <Stack.Screen name="TableDetailScreen" component={TableDetailScreen} options={{ title: 'Chi tiết bàn' , headerTitleAlign: "center"}} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}
