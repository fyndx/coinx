import { observer, useMount } from "@legendapp/state/react";
import { Button, Input } from "heroui-native";
import {
  Keyboard,
  StyleSheet,
  View,
  TouchableWithoutFeedback,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Text } from "@/components/ui/text";
import { DefaultUnitSelect } from "@/src/Containers/AddProduct/Components/DefaultUnitSelect";
import { rootStore } from "@/src/LegendState";

const AddProduct = observer(() => {
  const addProductScreenModel$ = rootStore.addProductScreenModel;

  const isAddProductInProgress = addProductScreenModel$.isLoading.get();

  const {
    id,
    name,
    notes = "",
    defaultUnitCategory,
  } = addProductScreenModel$.product.get();

  useMount(() => {
    return () => {
      addProductScreenModel$.resetProduct();
    };
  });

  const handleProductNameChange = (value: string) => {
    addProductScreenModel$.product.name.set(value);
  };

  const handleProductNotesChange = (value: string) => {
    addProductScreenModel$.product.notes.set(value);
  };

  const handleUnitCategoryChange = (value: string) => {
    addProductScreenModel$.product.defaultUnitCategory.set(value);
  };

  const handleSubmit = () => {
    if (id) {
      addProductScreenModel$.editProduct();
    } else {
      addProductScreenModel$.addProduct();
    }
  };

  return (
    // TODO: Add error messages for input and select
    <SafeAreaView style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View className="flex-1 p-4 justify-between">
          <View className="gap-3">
            <Input
              placeholder={"Product Name *"}
              value={name}
              onChangeText={handleProductNameChange}
              editable={!isAddProductInProgress}
              autoFocus
            />
            <Input
              placeholder={
                "Notes\n(eg. Describe your expectations, quality, usage etc.)"
              }
              value={notes ?? ""}
              onChangeText={handleProductNotesChange}
              editable={!isAddProductInProgress}
              multiline
              numberOfLines={4}
              className="min-h-[100px] text-top"
            />
            {/* Default Unit Select */}
            <DefaultUnitSelect
              value={defaultUnitCategory}
              onValueChange={handleUnitCategoryChange}
            />
          </View>
          <Button
            onPress={handleSubmit}
            // TODO: Disable Button unless input and select is valid
            isDisabled={isAddProductInProgress}
          >
            <Text>{id ? "Edit Product" : "Add Product"}</Text>
          </Button>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
});

export default AddProduct;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
