import React from "react";
import createBlock from "../writes/createBlock";

type BlockErrorBoundaryProps = { blockUid: string; message: string };
type BlockErrorBoundaryState = { hasError: boolean };

class BlockErrorBoundary extends React.Component<
  BlockErrorBoundaryProps,
  BlockErrorBoundaryState
> {
  constructor(props: BlockErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): BlockErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error): void {
    createBlock({
      node: { text: this.props.message.replace("{ERROR}", error.message) },
      parentUid: this.props.blockUid,
    });
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return <div>Component Failed To Load</div>;
    }
    return this.props.children;
  }
}

export default BlockErrorBoundary;
