import { observer, useMount } from "@legendapp/state/react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Button, Input, Select } from "heroui-native";
import { PlusCircle } from "lucide-react-native";
import { useRef } from "react";
import {
  ActivityIndicator,
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  type TextInput,
  View,
} from "react-native";

import { Text } from "@/src/Components/ui/Text";
import { rootStore } from "@/src/LegendState";
import { storeModel$ } from "@/src/LegendState/Store/Store.model";
import { SafeAreaView } from "@/src/Components/ui/SafeAreaView";

const AddProductListing = observer(() => {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const productModel$ = rootStore.addProductListingModel;

  const priceRef = useRef<TextInput>(null);
  const quantityRef = useRef<TextInput>(null);
  const urlRef = useRef<TextInput>(null);

  useMount(() => {
    const productId = id as string;
    if (!productId) {
      return;
    }

    // Fetch product details
    productModel$.getProductById(productId);
    storeModel$.getStoresList();

    return () => {
      productModel$.reset();
    };
  });

  const handleUnitChange = (selectedUnit: { label: string; value: string } | undefined) => {
    if (!selectedUnit) {
      return;
    }

    productModel$.productDetailsDraft.unit.set(selectedUnit.value);
  };

  const handleStoreChange = (selectedStore: { label: string; value: string } | undefined) => {
    if (!selectedStore) {
      return;
    }

    const stores = storeModel$.storesList.peek();

    const storeIndex = stores.findIndex((store) => store.id === selectedStore.value);

    const storeId = stores[storeIndex].id;
    productModel$.productDetailsDraft.storeId.set(storeId);
  };

  const addProductDetails = () => {
    productModel$.addProductDetails();
  };

  if (productModel$.product?.defaultUnitCategory?.get() === undefined) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
        <View className="p-4 gap-2">
          <Text>Loading...</Text>
          <ActivityIndicator />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View className="flex-1 p-4 justify-between">
        <View className="gap-2">
          <Input
            placeholder="Product Name *"
            aria-label={"Product Name"}
            returnKeyType="next"
            onSubmitEditing={() => priceRef.current?.focus()}
            onChangeText={(text) => productModel$.productDetailsDraft.name.set(text.trim())}
          />
          <Input
            ref={priceRef}
            placeholder="Price *"
            keyboardType={"numeric"}
            returnKeyType="next"
            onSubmitEditing={() => quantityRef.current?.focus()}
            onChangeText={(text) => {
              const value = Number.parseFloat(text.trim());
              if (!Number.isNaN(value)) {
                productModel$.productDetailsDraft.price.set(value);
              }
            }}
          />
          <Input
            ref={quantityRef}
            placeholder="Quantity *"
            keyboardType={"numeric"}
            returnKeyType="next"
            onSubmitEditing={() => urlRef.current?.focus()}
            onChangeText={(text) => {
              const value = Number.parseFloat(text.trim());
              if (!Number.isNaN(value)) {
                productModel$.productDetailsDraft.quantity.set(value);
              }
            }}
          />
          {/* Unit selection */}
          <Select onValueChange={handleUnitChange}>
            <Select.Trigger>
              <Select.Value placeholder="Unit *" />
              <Select.TriggerIndicator />
            </Select.Trigger>
            <Select.Portal>
              <Select.Overlay />
              <Select.Content presentation="popover" className="max-h-[50%] w-full bg-background">
                <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                  {productModel$.units.get().map((unit) => (
                    <Select.Item key={unit.value} value={unit.value} label={unit.label} />
                  ))}
                </ScrollView>
              </Select.Content>
            </Select.Portal>
          </Select>
          {/* Store selection */}
          <View className="flex-row items-center gap-2">
            <Select className="flex-1" onValueChange={handleStoreChange}>
              <Select.Trigger>
                <Select.Value placeholder="Store *" />
                <Select.TriggerIndicator />
              </Select.Trigger>
              <Select.Portal>
                <Select.Overlay />
                <Select.Content presentation="popover" className="max-h-[50%] w-full bg-background">
                  <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                    {storeModel$.storesList.get().map((store) => (
                      <Select.Item
                        key={store.id}
                        value={store.id}
                        label={`${store.name} - ${store.location}`}
                      />
                    ))}
                  </ScrollView>
                </Select.Content>
              </Select.Portal>
            </Select>

            <Pressable
              onPress={() => router.push("/add-store")}
              accessibilityRole="button"
              accessibilityLabel="Add store"
              hitSlop={10}
            >
              <PlusCircle size={24} color="#2563eb" accessible={false} />
            </Pressable>
          </View>
          <Input
            ref={urlRef}
            placeholder="URL"
            returnKeyType="done"
            onSubmitEditing={Keyboard.dismiss}
            onChangeText={(text) => productModel$.productDetailsDraft.url.set(text.trim())}
          />
        </View>
        <View>
          <Button onPress={addProductDetails}>
            <Text>Add</Text>
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default AddProductListing;
