package com.littlesteps.playschool.dto;

public class ClassDTO {
    private String id;
    private String name;
    private Integer capacity;
    private Boolean locked;
    private String room;

    public ClassDTO() {
    }

    public ClassDTO(String name, Integer capacity, String room) {
        this.name = name;
        this.capacity = capacity;
        this.room = room;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }

    public Boolean getLocked() {
        return locked;
    }

    public void setLocked(Boolean locked) {
        this.locked = locked;
    }

    public String getRoom() {
        return room;
    }

    public void setRoom(String room) {
        this.room = room;
    }
}
