import { Select as HeroUISelect, Separator, SearchField } from "heroui-native";
import React, { useState } from "react";
import { View } from "react-native";

interface CustomSelectProps<T> {
  placeholder: string;
  data: T[];
  displayField?: keyof T | ((item: T) => string);
  onValueChange?: (value: string) => void;
  value?: string;
}

export const Select = <T extends {}>({
  placeholder,
  data,
  onValueChange,
  displayField,
  value,
}: CustomSelectProps<T>) => {
  const [searchQuery, setSearchQuery] = useState("");

  const getDisplayValue = (item: T) => {
    if (!displayField) {
      return String(item);
    }
    if (typeof displayField === "function") {
      return displayField(item);
    }
    return String(item[displayField as keyof T]);
  };

  const formattedData = data.map((item) => {
    const label = getDisplayValue(item);
    return { label, value: label, original: item };
  });

  const filteredData = formattedData.filter((item) =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const selectValue = value ? { value, label: value } : undefined;

  return (
    <View className="w-full">
      <HeroUISelect
        value={selectValue}
        onValueChange={(selected) => {
          if (selected && !Array.isArray(selected)) {
            onValueChange?.(selected.value);
            setSearchQuery(""); // clear search on selection
          }
        }}
      >
        <HeroUISelect.Trigger>
          <HeroUISelect.Value placeholder={placeholder} />
          <HeroUISelect.TriggerIndicator />
        </HeroUISelect.Trigger>
        <HeroUISelect.Portal>
          <HeroUISelect.Overlay />
          <HeroUISelect.Content
            presentation="bottom-sheet"
            snapPoints={["75%", "90%"]}
          >
            <HeroUISelect.ListLabel className="px-4 py-2 font-semibold">
              {placeholder}
            </HeroUISelect.ListLabel>
            <View className="px-4 pb-2">
              <SearchField value={searchQuery} onChange={setSearchQuery}>
                <SearchField.Group>
                  <SearchField.SearchIcon />
                  <SearchField.Input placeholder="Search..." />
                  <SearchField.ClearButton />
                </SearchField.Group>
              </SearchField>
            </View>
            {filteredData.length > 0 ? (
              filteredData.map((item, index) => (
                <React.Fragment key={item.value}>
                  <HeroUISelect.Item value={item.value} label={item.label} />
                  {index < filteredData.length - 1 && <Separator />}
                </React.Fragment>
              ))
            ) : (
              <HeroUISelect.ListLabel className="px-4 py-4 text-center">
                No results found
              </HeroUISelect.ListLabel>
            )}
          </HeroUISelect.Content>
        </HeroUISelect.Portal>
      </HeroUISelect>
    </View>
  );
};
