/* global fetch FormData */
import React from 'react';
import { Camera, Permissions, Speech } from 'expo';
import { Text, View, TouchableOpacity, Vibration } from 'react-native';

const API_URL = 'http://max-image-caption-generator.max.us-south.containers.appdomain.cloud/model/predict';

export default class App extends React.Component {
  state = {
    hasCameraPermission: null,
    readyToCapture: true,
  };

  async componentDidMount() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({ hasCameraPermission: status === 'granted' });
  }

  capturePhoto = async () => {
    Speech.speak('Capturing Image');
    const photo = await this.camera.takePictureAsync({
      quality: 1,
    });
    this.camera.pausePreview();
    return photo;
  };

  fetchImageDescription = async (imageUri) => {
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

  captureImageAndAnalyze = async () => {
    this.setState({ readyToCapture: false });
    Vibration.vibrate([0, 100, 100, 100, 1500], true);

    const photo = await this.capturePhoto();
    const descriptionResponse = await this.fetchImageDescription(photo.uri);
    const descriptionResponseJSON = await descriptionResponse.json();
    console.debug('JSON Response: ', descriptionResponseJSON);
    const description = descriptionResponseJSON.predictions[0].caption;
    Speech.speak(description);

    this.setState({ readyToCapture: true });
    Vibration.cancel();
    this.camera.resumePreview();
  }

  handleTap = async () => {
    const { readyToCapture } = this.state;

    if (readyToCapture) {
      this.captureImageAndAnalyze();
    }
  }

  render() {
    const { hasCameraPermission } = this.state;

    if (hasCameraPermission === null) return <View />;

    if (hasCameraPermission === false) {
      Speech.speak('Camera access is required to use Iris');
      return <Text>Camera access is required to use Iris</Text>;
    }

    return (
      <View
        style={{ flex: 1 }}
        onResponderGrant={this.handleTap}
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
          <View style={{ flex: 1, backgroundColor: 'black', flexDirection: 'row' }}>
            <TouchableOpacity style={{ flex: 0.1, alignSelf: 'flex-end' }} />
          </View>
        </Camera>
      </View>
    );
  }
}
