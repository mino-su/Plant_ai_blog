package com.project.plant_parent.entity.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlElementWrapper;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlRootElement;
import lombok.Getter;
import lombok.Setter;

import java.util.Arrays;
import java.util.List;

@Getter
@Setter
@JsonIgnoreProperties(ignoreUnknown = true) // DTO에 적지 않은 다른 태그가 있어도 에러를 내지 않고 무시
@JacksonXmlRootElement(localName = "response") // <response> 태그와 이 클래스를 연결
public class PlantApiResponseDto {
    @JacksonXmlProperty(localName = "header")
    private HeaderDto headerDto;

    @JacksonXmlProperty(localName = "body")
    private BodyDto bodyDto;

    @Getter
    @Setter
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class HeaderDto{
        @JacksonXmlProperty(localName = "resultCode")
        private String resultCode;

        @JacksonXmlProperty(localName = "resultMsg")
        private String resultMsg;

        @JacksonXmlProperty(localName = "requestParameter")
        private String requestParameter;

        public boolean isSuccess() {
            return "00".equals(resultCode);
        }

    }

    @Getter
    @Setter
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class BodyDto{
        @JacksonXmlProperty(localName = "items")
        private ItemsDto items;

    }

    @Getter
    @Setter
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ItemsDto {
        @JacksonXmlElementWrapper(useWrapping = false)
        @JacksonXmlProperty(localName = "item")
        private List<ItemDto> itemDtoList;

        @JacksonXmlProperty(localName = "numOfRows")
        private int numOfRows;

        @JacksonXmlProperty(localName = "pageNo")
        private int pageNo;

        @JacksonXmlProperty(localName = "totalCount")
        private int totalCount;
    }

    @Getter
    @Setter
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ItemDto{

        @JacksonXmlProperty(localName = "cntntsNo")
        private String cntntsNo; // 컨텐츠 번호

        @JacksonXmlProperty(localName = "cntntsSj")
        private String cntntsSj; // 식물명



        @JacksonXmlProperty(localName = "rtnFileUrl")
        private String rtnFileUrl;

        @JacksonXmlProperty(localName = "rtnThumbFileUrl")
        private String rtnThumbFileUrl;


    }
}
