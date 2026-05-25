import { Tooltip, Icon, PopoverInteractionKind } from "@blueprintjs/core";
import React from "react";

type TooltipInteractionKind = React.ComponentProps<
  typeof Tooltip
>["interactionKind"];

type DescriptionProps = {
  description: React.ReactNode;
  interactionKind?: TooltipInteractionKind;
};

const Description = ({
  description,
  interactionKind = PopoverInteractionKind.HOVER_TARGET_ONLY,
}: DescriptionProps): React.ReactElement => {
  return (
    <span
      style={{
        marginLeft: 12,
        display: "inline-block",
        opacity: 0.8,
        verticalAlign: "text-bottom",
      }}
    >
      <Tooltip
        interactionKind={interactionKind}
        content={
          <span style={{ maxWidth: 400, display: "inline-block" }}>
            {description}
          </span>
        }
      >
        <Icon icon={"info-sign"} iconSize={12} />
      </Tooltip>
    </span>
  );
};

export default Description;
