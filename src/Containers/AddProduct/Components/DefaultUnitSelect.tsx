import { MeasurementUnits } from "@/src/utils/units";
import { Check, ChevronDown, ChevronUp } from "@tamagui/lucide-icons";
import { Keyboard } from "react-native";
import { Adapt, Select, Sheet, YStack } from "tamagui";
import { LinearGradient } from "tamagui/linear-gradient";

interface DefaultUnitSelectProps {
	onValueChange?: (value: (typeof MeasurementUnits)[number]) => void;
}

export const DefaultUnitSelect = ({
	onValueChange,
}: DefaultUnitSelectProps) => {
	return (
		<Select
			onValueChange={(value: (typeof MeasurementUnits)[number]) => {
				onValueChange?.(value);
			}}
			onOpenChange={(isOpen) => {
				if (isOpen) {
					Keyboard.dismiss();
				}
			}}
		>
			<Select.Trigger>
				<Select.Value placeholder={"Select a Unit"} />
			</Select.Trigger>
			<Adapt when="sm" platform="touch">
				<Sheet
					native={true}
					modal
					dismissOnSnapToBottom
					animationConfig={{
						type: "spring",
						damping: 20,
						mass: 1.2,
						stiffness: 250,
					}}
				>
					<Sheet.Frame>
						<Sheet.ScrollView>
							<Adapt.Contents />
						</Sheet.ScrollView>
					</Sheet.Frame>
					<Sheet.Overlay
						animation="lazy"
						enterStyle={{ opacity: 0 }}
						exitStyle={{ opacity: 0 }}
					/>
				</Sheet>
			</Adapt>
			<Select.Content>
				<Select.ScrollUpButton
					alignItems="center"
					justifyContent="center"
					position="relative"
					width="100%"
					height="$3"
				>
					<YStack zIndex={10}>
						<ChevronUp size={20} />
					</YStack>
					<LinearGradient
						start={[0, 0]}
						end={[0, 1]}
						fullscreen
						colors={["$background", "transparent"]}
						borderRadius="$4"
					/>
				</Select.ScrollUpButton>
				<Select.Viewport
					// to do animations:
					// animation="quick"
					// animateOnly={['transform', 'opacity']}
					// enterStyle={{ o: 0, y: -10 }}
					// exitStyle={{ o: 0, y: 10 }}
					minWidth={200}
				>
					<Select.Group>
						{MeasurementUnits.map((measurementUnit, i) => (
							<Select.Item
								index={i}
								key={measurementUnit}
								value={measurementUnit}
							>
								<Select.ItemText>{measurementUnit}</Select.ItemText>
								<Select.ItemIndicator marginLeft="auto">
									<Check size={16} />
								</Select.ItemIndicator>
							</Select.Item>
						))}
					</Select.Group>
				</Select.Viewport>
				<Select.ScrollDownButton
					alignItems="center"
					justifyContent="center"
					position="relative"
					width="100%"
					height="$3"
				>
					<YStack zIndex={10}>
						<ChevronDown size={20} />
					</YStack>
					<LinearGradient
						start={[0, 0]}
						end={[0, 1]}
						fullscreen
						colors={["transparent", "$background"]}
						borderRadius="$4"
					/>
				</Select.ScrollDownButton>
			</Select.Content>
		</Select>
	);
};
