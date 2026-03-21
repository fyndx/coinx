import { Select, Separator, SearchField } from "heroui-native";
import React, { useState } from "react";
import { View } from "react-native";

import { MeasurementUnits } from "@/src/utils/units";

interface DefaultUnitSelectProps {
  onValueChange?: (value: (typeof MeasurementUnits)[number]) => void;
  value?: string;
}

export const DefaultUnitSelect = ({
  onValueChange,
  value,
}: DefaultUnitSelectProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const selectValue = value ? { value, label: value } : undefined;

  const filteredUnits = MeasurementUnits.filter((unit) =>
    unit.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <View className="w-full">
      <Select
        value={selectValue}
        onValueChange={(selected) => {
          if (selected && !Array.isArray(selected)) {
            onValueChange?.(
              selected.value as (typeof MeasurementUnits)[number],
            );
            setSearchQuery(""); // clear search on selection
          }
        }}
        presentation="bottom-sheet"
      >
        <Select.Trigger>
          <Select.Value placeholder="Select a Unit *" />
          <Select.TriggerIndicator />
        </Select.Trigger>
        <Select.Portal>
          <Select.Overlay />
          <Select.Content
            presentation="bottom-sheet"
            snapPoints={["75%", "90%"]}
          >
            <Select.ListLabel className="px-4 py-2 font-semibold">
              Measurement Units
            </Select.ListLabel>
            <View className="px-4 pb-2">
              <SearchField value={searchQuery} onChange={setSearchQuery}>
                <SearchField.Group>
                  <SearchField.SearchIcon />
                  <SearchField.Input placeholder="Search units..." />
                  <SearchField.ClearButton />
                </SearchField.Group>
              </SearchField>
            </View>
            {filteredUnits.length > 0 ? (
              filteredUnits.map((unit, index) => (
                <React.Fragment key={unit}>
                  <Select.Item value={unit} label={unit} />
                  {index < filteredUnits.length - 1 && <Separator />}
                </React.Fragment>
              ))
            ) : (
              <Select.ListLabel className="px-4 py-4 text-center">
                No units found
              </Select.ListLabel>
            )}
          </Select.Content>
        </Select.Portal>
      </Select>
    </View>
  );
};
