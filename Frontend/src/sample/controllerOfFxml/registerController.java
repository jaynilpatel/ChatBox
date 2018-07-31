package sample.controllerOfFxml;

import com.jfoenix.controls.JFXPasswordField;
import com.jfoenix.controls.JFXTextField;
import javafx.event.ActionEvent;
import javafx.fxml.FXML;
import javafx.fxml.FXMLLoader;
import javafx.fxml.Initializable;
import javafx.scene.Node;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.scene.control.Label;
import javafx.stage.Stage;
import org.json.simple.JSONObject;
import sample.Main;
import sample.NodeJsServer;

import java.awt.*;
import java.io.IOException;
import java.io.StringWriter;
import java.net.URL;
import java.util.ResourceBundle;
import java.util.regex.Pattern;

public class registerController implements Initializable {


    String emailRegex = "^[a-zA-Z0-9_+&*-]+(?:\\."+
            "[a-zA-Z0-9_+&*-]+)*@" +
            "(?:[a-zA-Z0-9-]+\\.)+[a-z" +
            "A-Z]{2,7}$";

    Pattern pat = Pattern.compile(emailRegex);

    @FXML
    private JFXTextField firstName;
    @FXML
    private JFXTextField lastName;
    @FXML
    private JFXTextField username;
    @FXML
    private JFXPasswordField password;
    @FXML
    private JFXPasswordField repeatPassword;
    @FXML
    private JFXTextField emailId;

    @FXML
    private Label first_vali,last_vali,uname_vali,email_vali,pass_vali,repeatPass_vali;
    boolean f_vali,l_vali,u_vali,e_vali,p_vali,r_vali;
    public String responseStatus, registerRequest;
    Main main = new Main();

    public String jsonToString(String fname,String lname ,String uname,String pass,String email){

        JSONObject obj = new JSONObject();

        obj.put("fname", fname);
        obj.put("lname", lname);
        obj.put("uname", uname);
        obj.put("password", pass);
        obj.put("email", email);



        StringWriter out = new StringWriter();
        try {
            obj.writeJSONString(out);
        } catch (IOException e) {
            e.printStackTrace();
        }

        System.out.println(obj);
        String jsonText = out.toString();

        return jsonText;
    }



    @Override
    public void initialize(URL url, ResourceBundle rb){
    }
    public void onRegister(ActionEvent event) throws Exception{
        String fname = firstName.getText();
        String lname = lastName.getText();
        String uname = username.getText();
        String pass = password.getText();
        String repeatpass = repeatPassword.getText();
        String email = emailId.getText();

        if(fname.equals("")){
            first_vali.setText("Cannot be Empty");
            f_vali = false;}else{f_vali = true;first_vali.setText("");}
        if(lname.equals("")) {
            last_vali.setText("Cannot be Empty");
            l_vali = false;}else{l_vali = true;last_vali.setText("");}
        if(uname.equals("")){
            uname_vali.setText("Cannot be Empty");
            u_vali = false;}else{u_vali = true;uname_vali.setText("");}
        if(email.equals("")){
            email_vali.setText("Cannot be Empty");
            e_vali = false;}
        if(pat.matcher(email).matches()){
            e_vali = true;
            System.out.println("valid");
            e_vali = true;email_vali.setText("");
        }else{
            email_vali.setText("Invalid Email");
            e_vali = false;
            System.out.println("invalid");
        }
        if(pass.equals("")){
            pass_vali.setText("Cannot be Empty");
            p_vali = false;}else{p_vali = true;pass_vali.setText("");}
        if(repeatpass.equals("")){
            repeatPass_vali.setText("Cannot be Empty");
            r_vali = false;
        }
        else if(!(pass.equals(repeatpass))){
            repeatPass_vali.setText("Password not same");
            r_vali = false;
            System.out.println("invalid");
        }else{r_vali = true;repeatPass_vali.setText("");}

        int rs1=4;
        //System.out.println(uname+ pass);
        if (f_vali && l_vali && u_vali && e_vali && p_vali && r_vali) {
            registerRequest = jsonToString(fname, lname, uname, pass, email);

            //Connection starts here..
            NodeJsServer client = new NodeJsServer();
            String ip = "localhost";
            int port = 6997;
            client.socketConnect(ip, port);

            System.out.println("Sending Registration: " + registerRequest);
            responseStatus = client.echo(registerRequest);
            int rs = Integer.parseInt(responseStatus);
            //
            if (rs == 3) {
                /**
                 * Way to communicate between different different controller
                 */
                //*****************************************************************************//
                FXMLLoader loader = new FXMLLoader();
                loader.setLocation(getClass().getResource("../fxml/twoFactorAuth.fxml"));
                Parent root = loader.load();

                Scene scene = new Scene(root);

                Stage window = (Stage)((Node)event.getSource()).getScene().getWindow();
                window.setScene(scene);
                window.show();
                //*****************************************************************************//
            }
            else if (rs == 2) {
                System.out.println("Username already in use!!");
                FXMLLoader loader = new FXMLLoader();
                loader.setLocation(getClass().getResource("../fxml/registerError.fxml"));
                Parent root = loader.load();

                Scene scene = new Scene(root);

                registerErrorController controller = loader.getController();

                controller.initData("Sorry! That Username is Already in Use. Try Again");

                Stage window = (Stage) ((Node) event.getSource()).getScene().getWindow();
                window.setScene(scene);
                window.show();

            }
            if (rs1 == 0)
            {
                System.out.println("Registration Unsucessfull!!Your OTP is wrong!!");
                FXMLLoader loader = new FXMLLoader();
                loader.setLocation(getClass().getResource("../fxml/registerError.fxml"));
                Parent root = loader.load();

                Scene scene = new Scene(root);

                registerErrorController controller = loader.getController();

                controller.initData("OTP is Wrong. Register Again");

                Stage window = (Stage) ((Node) event.getSource()).getScene().getWindow();
                window.setScene(scene);
                window.show();
            }
            else if(rs1==1)
            {
                System.out.println("Registration Successfull!!Your OTP is Right!");
            }
        }
    }

    public void onBack() throws Exception{
        main.openWelcome();
    }
}
