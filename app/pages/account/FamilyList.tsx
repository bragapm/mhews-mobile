import {
  View,
  Text,
  ImageBackground,
  useColorScheme,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  ActivityIndicator,
  Image,
} from "react-native";
import FloatingSOSButton from "@/components/FloatingSOSButton";
import React, { useEffect, useState } from "react";
import useAuthStore from "../../hooks/auth";
import { useRouter } from "expo-router";
import { AntDesign, Feather, MaterialIcons } from "@expo/vector-icons";
import COLORS from "../../config/COLORS";
import { useAlert } from "@/components/AlertContext";
import ModalRemoveData from "@/components/ModalRemoveData";
import { HeaderNav } from "@/components/Header";

const familyMembers = [
  { name: "Dzaky Aditya", initials: "DA", location: "Bandung, Jawa Barat" },
  { name: "Kemal Abdillah", initials: "KA", location: "Bandung, Jawa Barat" },
  { name: "Puteri Tamada", initials: "PT", location: "Bandung, Jawa Barat" },
  { name: "Angelica Aprilia", initials: "AP", location: "Bandung, Jawa Barat" },
];

export default function FamilyListScreen() {
  const reset = useAuthStore((state) => state.reset);
  const router = useRouter();
  const { showAlert } = useAlert();
  const { profile, getProfile } = useAuthStore();
  const colorScheme = useColorScheme();
  const colors = COLORS();
  const [isShowDetailFamily, setIsShowDetailFamily] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const backgroundSource =
    colorScheme === "dark"
      ? require("@/assets/images/bg-page-dark.png")
      : require("@/assets/images/bg-page-light.png");

  useEffect(() => {
    getProfile();
  }, []);

  const handleRemoveMember = (name: string) => {
    setSelectedMember(name);
    setModalVisible(true);
  };

  const confirmRemoveMember = () => {
    if (selectedMember) {
      showAlert("success", `Member ${selectedMember} removed successfully!`);
      setModalVisible(false);
    }
  };

  const backToProfile = () => {
    if (isShowDetailFamily) {
      setIsShowDetailFamily(false);
    } else {
      router.push("/pages/account/FamilyProfile");
    }
  };

  const handleMemberDetail = (member: any) => {
    setIsShowDetailFamily(true);
  };

  return (
    <>
      <StatusBar
        translucent={true}
        backgroundColor="transparent"
        barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
      />
      <ImageBackground
        source={backgroundSource}
        style={styles.background}
        resizeMode="cover"
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <>
            <View style={styles.container}>
              {/* Header */}
              <HeaderNav onPress={backToProfile} title="Daftar Kerabat" />

              {/* Content */}
              {!isShowDetailFamily ? (
                <View
                  style={[
                    styles.contentOption,
                    {
                      backgroundColor:
                        colorScheme === "dark" ? "#1c1c1c" : "#fff",
                      borderRadius: 12,
                      height: "95%",
                      marginTop: "5%",
                      paddingVertical: "4%",
                      paddingHorizontal: 16,
                    },
                  ]}
                >
                  <Text style={styles.subTitle}>
                    Daftar Kerabat yang anda tambahkan pada aplikasi MHEWS
                  </Text>

                  <Text style={[styles.textOption]}>Daftar Kerabat (4)</Text>

                  {/* Family Members List */}
                  {familyMembers.map((member, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => handleMemberDetail(member)}
                      style={styles.memberContainer}
                    >
                      <View style={styles.memberInitials}>
                        <Text style={styles.initialsText}>
                          {member.initials}
                        </Text>
                      </View>
                      <View style={styles.memberInfo}>
                        <Text style={styles.memberName}>{member.name}</Text>
                        <Text style={styles.memberLocation}>
                          {member.location}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => handleRemoveMember(member.name)}
                        style={styles.removeButton}
                      >
                        <Text style={styles.removeText}>X Hapus</Text>
                      </TouchableOpacity>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <View
                  style={[
                    styles.contentOption,
                    {
                      backgroundColor:
                        colorScheme === "dark" ? "#1c1c1c" : "#fff",
                      borderRadius: 12,
                      height: "95%",
                      marginTop: "5%",
                      paddingVertical: "4%",
                      paddingHorizontal: 16,
                    },
                  ]}
                >
                  <View style={styles.memberContainerDetailFamily}>
                    <View style={styles.headerMemberDetail}>
                      <View style={styles.memberInitials}>
                        <Text style={styles.initialsText}>DA</Text>
                      </View>
                      <View style={styles.memberInfo}>
                        <Text style={styles.memberName}>Dzaky Aditya</Text>
                        <Text style={styles.memberLocation}>
                          Bandung, Jawa Barat
                        </Text>
                      </View>
                    </View>

                    {/* NIK section moved below memberInfo */}
                    <View style={styles.memberContainerDetail}>
                      <Text style={styles.memberName}>NIK</Text>
                      <Text style={styles.memberLocation}>
                        3202842211880004
                      </Text>
                    </View>
                    <View style={styles.memberContainerDetail}>
                      <Text style={styles.memberName}>No. Handphone</Text>
                      <Text style={styles.memberLocation}>+6281234567890</Text>
                    </View>
                    <View style={styles.memberContainerDetail}>
                      <Text style={styles.memberName}>Email</Text>
                      <Text style={styles.memberLocation}>user@email.com</Text>
                    </View>

                    <TouchableOpacity
                      style={styles.outlineButton}
                      onPress={() => handleRemoveMember("Dzaky Aditya")}
                      disabled={loading}
                    >
                      {loading ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <Text style={styles.outlineButtonText}>
                          Hapus Kerabat
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </>
        </ScrollView>
        <FloatingSOSButton />

        {/* Modal with dynamic title and message */}
        <ModalRemoveData
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onConfirm={confirmRemoveMember}
          title={`Anda Yakin untuk Hapus Kerabat ${selectedMember}?`}
          message={`Dengan menghapus kerabat anda tidak dapat berbagi aktivitas dan memantau ${selectedMember}, apakah anda yakin?`}
        />
      </ImageBackground>
    </>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  subTitle: {
    fontSize: 14,
    textAlign: "left",
    color: "#666",
    marginBottom: 10,
    marginLeft: 10,
  },
  container: { flex: 1, padding: 16, marginTop: "5%" },
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginRight: 20,
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  contentOption: {
    borderRadius: 12,
    width: "100%",
  },
  textOption: {
    marginLeft: 10,
    marginBottom: 5,
    fontSize: 14,
    fontWeight: "500",
    textAlign: "left",
  },
  memberContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    marginLeft: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
  },
  headerMemberDetail: {
    flexDirection: "row",
    alignItems: "center",
  },
  memberContainerDetailFamily: {
    flexDirection: "column",
    alignItems: "flex-start",
    marginBottom: 8,
    marginLeft: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
  },
  memberContainerDetail: {
    marginTop: 8,
  },
  memberInitials: {
    backgroundColor: "#FFA500",
    borderRadius: 20,
    padding: 8,
    marginRight: 12,
  },
  initialsText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  memberLocation: {
    fontSize: 14,
    color: "#666",
  },
  removeButton: {
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderColor: "#E64040",
    borderRadius: 12,
  },
  removeText: {
    color: "#E64040",
    fontSize: 14,
    fontWeight: "500",
  },
  outlineButton: {
    borderWidth: 2,
    borderColor: "#E64040",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    width: "100%",
    marginTop: 20,
  },
  outlineButtonText: {
    color: "#E64040",
    fontSize: 16,
    fontWeight: "600",
  },
});
