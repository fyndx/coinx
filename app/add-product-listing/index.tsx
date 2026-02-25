import { observer, useMount } from "@legendapp/state/react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Button } from "heroui-native";
import { PlusCircle } from "lucide-react-native";
import { useRef } from "react";
import {
  ActivityIndicator,
  Keyboard,
  Pressable,
  StyleSheet,
  type TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Select } from "@/src/Components/Select";
import { Input } from "@/src/Components/ui/Input";
import { Text } from "@/src/Components/ui/Text";
import { rootStore } from "@/src/LegendState";
import { storeModel$ } from "@/src/LegendState/Store/Store.model";

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

  const handleUnitChange = (value: string) => {
    productModel$.productDetailsDraft.unit.set(value);
  };

  const handleStoreChange = (value: string) => {
    const stores = storeModel$.storesList.peek();

    const storeIndex = stores.findIndex(
      (store) => `${store.name} - ${store.location}` === value,
    );

    const storeId = stores[storeIndex].id;
    productModel$.productDetailsDraft.storeId.set(storeId);
  };

  const addProductDetails = () => {
    productModel$.addProductDetails();
  };

  if (productModel$.product?.defaultUnitCategory?.get() === undefined) {
    return (
      <SafeAreaView>
        <View className="p-4 gap-2">
          <Text>Loading...</Text>
          <ActivityIndicator />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View className="flex-1 p-4 justify-between">
        <View className="gap-2">
          <Input
            placeholder="Product Name *"
            aria-label={"Product Name"}
            returnKeyType="next"
            onSubmitEditing={() => priceRef.current?.focus()}
            onChangeText={(text) =>
              productModel$.productDetailsDraft.name.set(text.trim())
            }
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
          <Select
            placeholder={"Unit *"}
            data={productModel$.units.get()}
            onValueChange={handleUnitChange}
          />
          <View className="flex-row items-center gap-2">
            <View className="flex-1">
              <Select
                placeholder={"Store *"}
                data={storeModel$.storesList.get()}
                displayField={(item: {
                  name: string;
                  location: string | null;
                }) => `${item.name} - ${item.location}`}
                onValueChange={handleStoreChange}
              />
            </View>
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
            onChangeText={(text) =>
              productModel$.productDetailsDraft.url.set(text.trim())
            }
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
