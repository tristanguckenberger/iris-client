import React from 'react';
import { Camera, Permissions } from 'expo';
import { Text, View, TouchableOpacity, Vibration } from 'react-native';

export default class App extends React.Component {
  state = {
    hasCameraPermission: null,
  };

  async componentDidMount() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({ hasCameraPermission: status === 'granted' });
  }

  handleTouchPress = () => {
    console.debug('Touch press');
    Vibration.vibrate();
  }

  handleTouchRelease = () => {
    console.debug('Touch release');
  }

  render() {
    const { hasCameraPermission } = this.state;

    if (hasCameraPermission === null) return <View />;

    // TODO: Handle user denying camera permission
    if (hasCameraPermission === false) {
      return <Text>No access to camera</Text>;
    }

    return (
      <View
        style={{ flex: 1 }}
        onResponderGrant={this.handleTouchPress}
        onResponderRelease={this.handleTouchRelease}
        onStartShouldSetResponder={() => true}
      >
        <Camera
          style={{ flex: 1 }}
          type={Camera.Constants.Type.back}
          autoFocus={Camera.Constants.AutoFocus.on}
          onCameraReady={() => console.log('Camera ready')}
          ratio="16:9"
        >
          <View style={{ flex: 1, backgroundColor: 'transparent', flexDirection: 'row' }}>
            <TouchableOpacity style={{ flex: 0.1, alignSelf: 'flex-end' }} />
          </View>
        </Camera>
      </View>
    );
  }
}
