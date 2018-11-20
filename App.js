/* global fetch FormData */
import React from 'react';
import { Camera, Permissions, Speech } from 'expo';
import { Text, View, TouchableOpacity, Vibration } from 'react-native';

const API_URL = 'http://max-image-caption-generator.max.us-south.containers.appdomain.cloud/model/predict';

export default class App extends React.Component {
  state = {
    hasCameraPermission: null,
  };

  async componentDidMount() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({ hasCameraPermission: status === 'granted' });
  }

  capturePhoto = async () => {
    Speech.speak('Capturing');

    if (this.camera) {
      const photo = await this.camera.takePictureAsync();
      return photo;
    }

    return null;
  };

  getDescription = async (imageUri) => {
    const uriParts = imageUri.split('.');
    const fileType = uriParts[uriParts.length - 1];

    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      name: 'image.jpeg',
      type: `image/${fileType}`,
    });

    // Send the request
    return fetch(API_URL, {
      method: 'POST',
      body: formData,
      headers: {
        'content-type': 'multipart/form-data',
      },
    })
      .catch(error => console.error('Error:', error));
  }

  handleTouchPress = async () => {
    Vibration.vibrate(100);
    const photo = await this.capturePhoto();
    const descriptionResponse = await this.getDescription(photo.uri);
    const descriptionResponseJSON = await descriptionResponse.json();
    console.debug('JSON Response: ', descriptionResponseJSON);
    const description = descriptionResponseJSON.predictions[0].caption;
    Speech.speak(description);
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
        onStartShouldSetResponder={() => true}
      >
        <Camera
          style={{ flex: 1 }}
          ref={(ref) => {
            this.camera = ref;
          }}
          type={Camera.Constants.Type.back}
          autoFocus={Camera.Constants.AutoFocus.on}
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
