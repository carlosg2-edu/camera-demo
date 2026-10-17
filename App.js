import { useRef, useState } from 'react';
import { Alert, Button, Image, Platform, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library/legacy';

export default function App() {
  const [mediaPermission, requestMediaPermission] = MediaLibrary.usePermissions();
  const [facing, setFacing] = useState('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [photoUri, setPhotoUri] = useState(null);
  const cameraRef = useRef(null);

  // Mientras los permisos no se han resuelto, no mostramos nada
  if (!permission) {
    return <View />;
  }

  // Si el permiso fue denegado, mostramos un botón para solicitarlo
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          Necesitamos tu permiso para acceder a la cámara
        </Text>
        <Button onPress={requestPermission} title="Conceder permiso" />
      </View>
    );
  }

  // Alterna entre cámara frontal y trasera
  function toggleCameraFacing() {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  }

  // Captura una foto y guarda su URI en el estado
  async function takePicture() {
  try {
    if (!cameraRef.current) return;

    const photo = await cameraRef.current.takePictureAsync();
    setPhotoUri(photo.uri);

    //await savePhoto(photo.uri);
  } catch (error) {
    Alert.alert('Error', 'No se pudo tomar la foto.');
    console.error(error);
  }
  }

  async function savePhoto(uri) {
  try {
    if (Platform.OS === 'web') {
      const link = document.createElement('a');
      link.href = uri;
      link.download = `REACTIMG-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    if (!mediaPermission?.granted) {
      const permissionResponse = await requestMediaPermission();
      if (!permissionResponse.granted) {
        Alert.alert(
          'Permiso requerido',
          'Necesitamos permiso para guardar la foto en la galería.'
        );
        return;
      }
    }

    await MediaLibrary.saveToLibraryAsync(uri);
    Alert.alert('Éxito', 'La foto se guardó en la galería.');
  } catch (error) {
    Alert.alert('Error', 'No se pudo guardar la foto.');
    console.error(error);
  }
  }

  // Si ya se tomó una foto, la muestra con opción de volver a la cámara
  if (photoUri) {
    return (
      <View style={styles.container}>
        <Image source={{ uri: photoUri }} style={styles.preview} />
        <TouchableOpacity style={styles.retakeButton} onPress={() => setPhotoUri(null)}>
          <Text style={styles.text}>Tomar otra foto</Text>
        </TouchableOpacity>
        <Button onPress={() => savePhoto(photoUri)} title="Guardar foto"></Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
            <Text style={styles.text}>Voltear cámara</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
            <View style={styles.captureInner} />
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    marginBottom: 70
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    margin: 64,
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  button: {
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
  captureButton: {
    alignSelf: 'flex-end',
    alignItems: 'center',
    justifyContent: 'center',
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 4,
    borderColor: 'white',
    backgroundColor: 'transparent',
  },
  captureInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'white',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  preview: {
    flex: 1,
  },
  retakeButton: {
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#000',
  },
});

