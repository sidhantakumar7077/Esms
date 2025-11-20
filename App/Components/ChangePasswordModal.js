import React, { useState, useEffect } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSelector } from 'react-redux';
import UseApi from '../ApiConfig';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ChangePasswordModal = ({ visible, onClose }) => {
    const { userData } = useSelector(state => state.User);
    const { Request } = UseApi();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // pre-fill username when modal opens
    useEffect(() => {
        if (visible) {
            setUsername(userData?.username || '');
            setPassword('');
            setConfirmPassword('');
            setError('');
            setShowPassword(false);
            setShowConfirmPassword(false);
        }
    }, [visible, userData]);

    const validate = () => {
        if (!username.trim() || !password || !confirmPassword) {
            setError('Please fill all fields.');
            return false;
        }
        if (password.length < 4) {
            setError('Password must be at least 4 characters.');
            return false;
        }
        if (password.length > 10) {
            setError('Password cannot be more than 10 characters.');
            return false;
        }
        if (password !== confirmPassword) {
            setError('New password and confirm password must match.');
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        setLoading(true);
        setError('');

        const params = {
            user_id: userData?.id,
            username: username.trim(),
            password,
            confirm_password: confirmPassword,
        };

        let res;
        try {
            res = await Request('update-student-login-credential', 'POST', params);
            console.log('update login response', res);
        } catch (e) {
            console.log('update error', e);
        }

        setLoading(false);

        if (res?.status) {
            alert(res?.message || 'Login details updated successfully.');
            onClose();
        } else {
            setError(res?.message || 'Failed to update login details.');
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.backdrop}
            >
                <View style={styles.modalContainer}>
                    {/* Header */}
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Change Login Details</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Text style={styles.closeText}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Username */}
                    <View style={styles.fieldGroup}>
                        <Text style={styles.label}>Username</Text>
                        <TextInput
                            value={username}
                            onChangeText={setUsername}
                            placeholder="Enter username"
                            style={styles.input}
                            autoCapitalize="none"
                        />
                    </View>

                    {/* New Password */}
                    <View style={styles.fieldGroup}>
                        <Text style={styles.label}>New Password</Text>
                        <View style={styles.inputWrapper}>
                            <TextInput
                                value={password}
                                onChangeText={setPassword}
                                placeholder="Enter new password"
                                style={styles.inputInner}
                                secureTextEntry={!showPassword}
                                maxLength={10}
                            />
                            <TouchableOpacity
                                style={styles.eyeButton}
                                onPress={() => setShowPassword(prev => !prev)}
                            >
                                <Icon
                                    name={showPassword ? 'visibility-off' : 'visibility'}
                                    size={20}
                                    color="#6b7280"
                                />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.helperText}>4–10 characters</Text>
                    </View>

                    {/* Confirm Password */}
                    <View style={styles.fieldGroup}>
                        <Text style={styles.label}>Confirm Password</Text>
                        <View style={styles.inputWrapper}>
                            <TextInput
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                placeholder="Re-enter new password"
                                style={styles.inputInner}
                                secureTextEntry={!showConfirmPassword}
                                maxLength={10}
                            />
                            <TouchableOpacity
                                style={styles.eyeButton}
                                onPress={() => setShowConfirmPassword(prev => !prev)}
                            >
                                <Icon
                                    name={showConfirmPassword ? 'visibility-off' : 'visibility'}
                                    size={20}
                                    color="#6b7280"
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {error ? <Text style={styles.errorText}>{error}</Text> : null}

                    {/* Buttons */}
                    <View style={styles.buttonRow}>
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton]}
                            onPress={onClose}
                            disabled={loading}
                        >
                            <Text style={[styles.buttonText, { color: '#000' }]}>
                                Cancel
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.button, styles.saveButton]}
                            onPress={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>Save</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

export default ChangePasswordModal;

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.35)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    modalContainer: {
        width: '100%',
        borderRadius: 18,
        backgroundColor: '#ffffff',
        padding: 18,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    modalTitle: {
        fontSize: 18,
        fontFamily: 'System',
        color: '#000',
    },
    closeText: {
        fontSize: 20,
        color: '#6b7280',
    },
    fieldGroup: {
        marginTop: 10,
    },
    label: {
        fontSize: 14,
        color: '#6b7280',
        marginBottom: 4,
    },
    input: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 8,
        fontSize: 14,
        color: '#000',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 10,
        paddingHorizontal: 8,
    },
    inputInner: {
        flex: 1,
        paddingVertical: 8,
        fontSize: 14,
        color: '#000',
    },
    eyeButton: {
        paddingHorizontal: 4,
        paddingVertical: 4,
    },
    helperText: {
        marginTop: 4,
        fontSize: 12,
        color: '#9ca3af',
    },
    errorText: {
        marginTop: 10,
        color: '#b91c1c',
        fontSize: 14,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 18,
    },
    button: {
        paddingHorizontal: 16,
        paddingVertical: 9,
        borderRadius: 999,
        marginLeft: 8,
    },
    cancelButton: {
        backgroundColor: '#e5e7eb',
    },
    saveButton: {
        backgroundColor: '#16a34a',
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 14,
        fontFamily: 'System',
    },
});