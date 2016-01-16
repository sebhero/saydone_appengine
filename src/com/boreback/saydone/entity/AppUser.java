package com.boreback.saydone.entity;

import javax.jdo.annotations.*;
import java.util.List;

/**
 * Created by seb_user on 2014-10-12.
 */
@PersistenceCapable(identityType = IdentityType.APPLICATION)
public class AppUser {

    @PrimaryKey
    @Persistent
    String id;

    @Persistent
    String email;

    @Persistent
    List<AppRole> role;

    @Persistent
    boolean isSusspende=false;

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getId() {

        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public List<AppRole> getRole() {
        return role;
    }

    public void setRole(List<AppRole> appRole) {
        this.role = appRole;
    }

    public boolean isSusspende() {
        return isSusspende;
    }

    public void setSusspende(boolean isSusspende) {
        this.isSusspende = isSusspende;
    }
}
