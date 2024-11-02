import { Check, ChevronDown, ChevronUp } from "@tamagui/lucide-icons";
import { Adapt, Sheet, Select as TamaguiSelect, YStack } from "tamagui";
import { LinearGradient } from "tamagui/linear-gradient";

interface DefaultUnitSelectProps {
	data: string[];
	onValueChange?: (value: string) => void;
}

export const Select = ({ data, onValueChange }: DefaultUnitSelectProps) => {
	return (
		<TamaguiSelect
			onValueChange={(value) => {
				onValueChange?.(value);
			}}
		>
			<TamaguiSelect.Trigger size={"$4.5"}>
				<TamaguiSelect.Value placeholder={"Select a Unit"} />
			</TamaguiSelect.Trigger>
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
			<TamaguiSelect.Content>
				<TamaguiSelect.ScrollUpButton
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
				</TamaguiSelect.ScrollUpButton>
				<TamaguiSelect.Viewport
					// to do animations:
					// animation="quick"
					// animateOnly={['transform', 'opacity']}
					// enterStyle={{ o: 0, y: -10 }}
					// exitStyle={{ o: 0, y: 10 }}
					minWidth={200}
				>
					<TamaguiSelect.Group>
						{data.map((item, index) => (
							<TamaguiSelect.Item index={index} key={item} value={item}>
								<TamaguiSelect.ItemText>{item}</TamaguiSelect.ItemText>
								<TamaguiSelect.ItemIndicator marginLeft="auto">
									<Check size={16} />
								</TamaguiSelect.ItemIndicator>
							</TamaguiSelect.Item>
						))}
					</TamaguiSelect.Group>
				</TamaguiSelect.Viewport>
				<TamaguiSelect.ScrollDownButton
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
				</TamaguiSelect.ScrollDownButton>
			</TamaguiSelect.Content>
		</TamaguiSelect>
	);
};
