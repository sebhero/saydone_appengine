package com.boreback.saydone.email;

import javax.mail.*;
import javax.mail.internet.AddressException;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.util.Properties;

/**
 * Created by seb_user on 2014-10-20.
 */
public class MailHandlerServlet extends HttpServlet {
    @Override
    public void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws IOException {
        Properties props = new Properties();
        Session session = Session.getDefaultInstance(props, null);
        try {
            MimeMessage message = new MimeMessage(session, req.getInputStream());
            System.out.println("message subject "+message.getSubject());


            Address[] froms = message.getFrom();
            String email = froms == null ? null : ((InternetAddress) froms[0]).getAddress();
            System.out.println("from "+email);

//            resp.setContentType("text/plain");
  //          resp.getWriter().println(message);

            String theText = getText(message);
            System.out.println(theText);

            String theMessage = "From: "+email+"\n"+"subject: "+message.getSubject()+"\n"+theText;

            forwardThemailToMe(theMessage);
        } catch (MessagingException e) {
            e.printStackTrace();
        }
        catch (UnsupportedEncodingException e) {
            e.printStackTrace();
        }
    }

    private boolean textIsHtml = false;
    /**
     * Return the primary text content of the message.
     */
    private String getText(Part p) throws
            MessagingException, IOException {
        if (p.isMimeType("text/*")) {
            String s = (String)p.getContent();
            textIsHtml = p.isMimeType("text/html");
            return s;
        }

        if (p.isMimeType("multipart/alternative")) {
            // prefer html text over plain text
            Multipart mp = (Multipart)p.getContent();
            String text = null;
            for (int i = 0; i < mp.getCount(); i++) {
                Part bp = mp.getBodyPart(i);
                if (bp.isMimeType("text/plain")) {
                    if (text == null)
                        text = getText(bp);
                    continue;
                } else if (bp.isMimeType("text/html")) {
                    String s = getText(bp);
                    if (s != null)
                        return s;
                } else {
                    return getText(bp);
                }
            }
            return text;
        } else if (p.isMimeType("multipart/*")) {
            Multipart mp = (Multipart)p.getContent();
            for (int i = 0; i < mp.getCount(); i++) {
                String s = getText(mp.getBodyPart(i));
                if (s != null)
                    return s;
            }
        }

        return null;
    }

    private void forwardThemailToMe(String message) throws UnsupportedEncodingException, MessagingException {
        Properties props = new Properties();
        Session session = Session.getDefaultInstance(props, null);



        try {
            String msgBody = message;
            Message msg = new MimeMessage(session);
            msg.setFrom(new InternetAddress("contact@say-done.appspotmail.com", "Saydone Admin"));
            msg.addRecipient(Message.RecipientType.TO,
                    new InternetAddress("trevligt.att.ses@gmail.com", "Mr. Seb"));
            msg.setSubject("Email from Say-done");
            msg.setText(msgBody);
            Transport.send(msg);

        } catch (AddressException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
